import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { updateCustomer } from "@/lib/models";
import { validate } from "@/lib/validators";
import { uploadImageBuffer, deleteImage } from "@/lib/cloudinary";
import { calculateHealthScore } from "@/lib/analysis/health-score";
import { deriveConcerns, extractConcernKeywords } from "@/lib/analysis/concerns";
import { generateRoutine } from "@/lib/analysis/routine";
import { matchRoutineWithProducts } from "@/lib/analysis/productMatching";
import { analysisSchema } from "@/lib/schemas/analysis";
import type { AnalysisSource, RawScores, SkinType, UserProfile } from "@/lib/schemas/analysis";

const ML_SERVICE_SECRET = process.env.ML_SERVICE_SECRET;

interface MLCallbackPayload {
  analysis_id: string;
  skin_type: string;
  sensitive?: boolean;
  confidence?: number;
  disagreement?: boolean;
  final_scores?: {
    sebum_level?: number;
    hydration_level?: number;
    acne_frequency?: number;
    pore_size?: number;
    sensitivity_score?: number;
    roughness_score?: number;
    tightness_score?: number;
  };
  raw_debug?: {
    quiz_oiliness?: number;
    image_oiliness?: number;
    quiz_acne?: number;
    image_acne?: number;
    skin_type_probabilities?: Record<string, number>;
  };
  user_notes?: string;
  timestamp?: string;
}

const PHOTO_FIELDS = [
  "front",
  "left_profile",
  "right_profile",
  "forehead_closeup",
  "left_cheek_closeup",
  "right_cheek_closeup",
] as const;

function isValidSkinType(value: string): value is SkinType {
  return ["oily", "dry", "combination", "sensitive", "normal"].includes(value);
}

function normalizeProbabilities(
  probabilities: Record<string, number> | undefined,
  skinType: SkinType
): Record<string, number> {
  if (!probabilities || Object.keys(probabilities).length === 0) {
    return { [skinType]: 0.85 };
  }
  const normalized: Record<string, number> = {};
  for (const [key, value] of Object.entries(probabilities)) {
    normalized[key] = Math.max(0, Math.min(1, Number(value)));
  }
  return normalized;
}

async function clearOlderAnalysisPhotos(customerId: string, currentAnalysisId: string) {
  try {
    const snapshot = await db
      .collection("analyses")
      .where("customerId", "==", customerId)
      .get();

    const analyses = [...snapshot.docs].sort((a, b) => {
      const createdAtDifference = String(b.data().createdAt ?? "").localeCompare(
        String(a.data().createdAt ?? "")
      );
      return createdAtDifference || b.id.localeCompare(a.id);
    });
    const previousAnalyses = analyses
      .filter((doc) => doc.id !== currentAnalysisId)
      .slice(1);

    for (const document of previousAnalyses) {
      const photoUrls = (document.data().photoUrls as string[] | undefined) ?? [];
      if (photoUrls.length === 0) continue;

      const folderPath = `glowguide/analyses/${document.id}`;
      await Promise.all(
        photoUrls.map(async (photoUrl, photoIndex) => {
          if (!photoUrl) return;
          try {
            await deleteImage(folderPath, String(photoIndex));
          } catch (error) {
            console.error(
              `Cloudinary delete failed for analysis ${document.id}, photo ${photoIndex}:`,
              error
            );
          }
        })
      );
      await document.ref.update({ photoUrls: [] });
    }
  } catch (error) {
    console.error("Failed to clean up older analysis photos:", error);
  }
}

export async function POST(request: NextRequest) {
  if (!ML_SERVICE_SECRET) {
    console.error("ML_SERVICE_SECRET is not configured");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const secret = request.headers.get("x-internal-secret");
  if (!secret || secret !== ML_SERVICE_SECRET) {
    console.error("Callback rejected: invalid X-Internal-Secret");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: MLCallbackPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { analysis_id } = payload;
  if (!analysis_id) {
    return NextResponse.json({ error: "Missing analysis_id" }, { status: 400 });
  }

  console.log(`[${analysis_id}] Callback received from ML service`);

  const docRef = db.collection("analyses").doc(analysis_id);
  const doc = await docRef.get();
  if (!doc.exists) {
    console.error(`[${analysis_id}] Analysis document not found`);
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  const existing = doc.data()!;
  if (existing.status === "completed") {
    console.warn(`[${analysis_id}] Late or duplicate ML callback ignored after completion`, {
      callback: payload,
    });
    return NextResponse.json({ ok: true });
  }

  const quizAnswers = existing.quizAnswers as Record<string, number>;
  const normalizedAnswers = {
    sebum_level: Number(quizAnswers.sebum_level ?? 50),
    hydration_level: Number(quizAnswers.hydration_level ?? 50),
    acne_frequency: Number(quizAnswers.acne_frequency ?? 0),
    pore_size: Number(quizAnswers.pore_size ?? 50),
    sensitivity_score: Number(quizAnswers.sensitivity_score ?? 0),
    roughness_score: Number(quizAnswers.roughness_score ?? 0),
    tightness_score: Number(quizAnswers.tightness_score ?? 0),
  };

  const skinType = isValidSkinType(payload.skin_type)
    ? payload.skin_type
    : "normal";
  const confidence = Math.max(0, Math.min(1, payload.confidence ?? 0.85));
  const probabilities = normalizeProbabilities(
    payload.raw_debug?.skin_type_probabilities,
    skinType
  );

  const rawScores: RawScores = {
    quiz_oiliness: payload.raw_debug?.quiz_oiliness ?? normalizedAnswers.sebum_level,
    image_oiliness: payload.raw_debug?.image_oiliness ?? 0,
    final_oiliness: payload.final_scores?.sebum_level ?? normalizedAnswers.sebum_level,
    quiz_acne: payload.raw_debug?.quiz_acne ?? normalizedAnswers.acne_frequency,
    image_acne: payload.raw_debug?.image_acne ?? 0,
    final_acne: payload.final_scores?.acne_frequency ?? normalizedAnswers.acne_frequency,
  };

  const concerns = deriveConcerns({
    quizAnswers: normalizedAnswers,
    keywords: extractConcernKeywords(existing.skinNotes),
    skinType,
  });
  const healthScore = calculateHealthScore(concerns, confidence);
  let routine;
  try {
    routine = await matchRoutineWithProducts(
      generateRoutine({ skinType, concerns }),
      concerns as { name: string }[],
      existing.userProfile as UserProfile,
      skinType
    );
  } catch (error) {
    console.error(`[${analysis_id}] Failed to match routine products:`, error);
    return NextResponse.json({ error: "Failed to build routine recommendations" }, { status: 500 });
  }
  const callbackResult = {
    skinType,
    concerns,
    healthScore,
    confidence,
    probabilities,
    routine,
    sensitive: payload.sensitive ?? skinType === "sensitive",
    disagreement: payload.disagreement ?? false,
    rawScores,
  };

  try {
    const applied = await db.runTransaction(async (transaction) => {
      const currentSnapshot = await transaction.get(docRef);
      if (!currentSnapshot.exists) return false;

      const current = currentSnapshot.data()!;
      if (current.status === "completed") {
        console.warn(`[${analysis_id}] Late or duplicate ML callback ignored after completion`, {
          callback: payload,
        });
        return false;
      }

      const updated = validate(analysisSchema, {
        ...current,
        result: callbackResult,
        source: "ml-service" as AnalysisSource,
        status: "completed",
      });
      transaction.set(docRef, updated);
      return true;
    });

    if (applied) {
      await updateCustomer(existing.customerId, {
        skinProfile: {
          skinType,
          concerns: concerns.map((c) => c.name),
        },
      });

      await clearOlderAnalysisPhotos(existing.customerId, analysis_id);
    } else {
      return NextResponse.json({ ok: true });
    }

    console.log(`[${analysis_id}] Analysis completed: skin_type=${skinType} confidence=${confidence}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`[${analysis_id}] Failed to update analysis:`, error);
    return NextResponse.json({ error: "Failed to update analysis" }, { status: 500 });
  }
}
