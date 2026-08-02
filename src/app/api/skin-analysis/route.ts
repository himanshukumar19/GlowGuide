import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import NodeFormData from "form-data";
import { authorize } from "@/lib/api-auth";
import { getCustomerById, updateCustomer } from "@/lib/models";
import { createAnalysis } from "@/lib/models";
import { db } from "@/lib/firebase-admin";
import { uploadImageBuffer, deleteImage } from "@/lib/cloudinary";
import { calculateHealthScore } from "@/lib/analysis/health-score";
import { deriveConcerns } from "@/lib/analysis/concerns";
import { generateRoutine } from "@/lib/analysis/routine";
import type { AnalysisSource, RawScores, SkinType, UserProfile } from "@/lib/schemas/analysis";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "https://glowguide-ml-service.onrender.com";
const FORCE_FALLBACK = process.env.FORCE_FALLBACK === "true";
const FREE_TIER_ANALYSIS_LIMIT = 3;
const PHOTO_FIELDS = [
  "front",
  "left_profile",
  "right_profile",
  "forehead_closeup",
  "left_cheek_closeup",
  "right_cheek_closeup",
] as const;

type PhotoField = (typeof PHOTO_FIELDS)[number];

interface MLPrediction {
  skin_type: string;
  confidence?: number;
  probabilities?: Record<string, number>;
  sensitive?: boolean;
  disagreement?: boolean;
  final_scores?: {
    sebum_level?: number;
    acne_frequency?: number;
  };
  raw_debug?: {
    quiz_oiliness?: number;
    image_oiliness?: number;
    quiz_acne?: number;
    image_acne?: number;
    skin_type_probabilities?: Record<string, number>;
  };
  concerns_detected?: string[];
}

function normalizeQuizAnswers(answers: Record<string, number>): Record<string, number> {
  return {
    sebum_level: Number(answers.sebum_level ?? 50),
    hydration_level: Number(answers.hydration_level ?? 50),
    acne_frequency: Number(answers.acne_frequency ?? 0),
    pore_size: Number(answers.pore_size ?? 50),
    sensitivity_score: Number(answers.sensitivity_score ?? 0),
    roughness_score: Number(answers.roughness_score ?? 0),
    tightness_score: Number(answers.tightness_score ?? 0),
  };
}

function fallbackClassify(answers: Record<string, number>): SkinType {
  const sebum = answers.sebum_level ?? 50;
  const hydration = answers.hydration_level ?? 50;
  const acne = answers.acne_frequency ?? 50;
  const pore = answers.pore_size ?? 50;
  const sensitivity = answers.sensitivity_score ?? 50;
  const roughness = answers.roughness_score ?? 50;
  const tightness = answers.tightness_score ?? 30;

  if (sensitivity >= 60) return "sensitive";

  let oilyScore = 0;
  let dryScore = 0;

  if (sebum >= 65) oilyScore += 3;
  else if (sebum >= 55) oilyScore += 1.5;
  else if (sebum <= 30) dryScore += 3;
  else if (sebum <= 45) dryScore += 1.5;

  if (hydration <= 36) dryScore += 3;
  else if (hydration <= 45) dryScore += 1.5;

  if (acne >= 70) oilyScore += 2;
  else if (acne >= 55) oilyScore += 1;

  if (pore >= 68) oilyScore += 2;
  else if (pore >= 55) oilyScore += 1;

  if (roughness <= 35) dryScore += 2;
  else if (roughness <= 45) dryScore += 1;

  if (tightness >= 70) dryScore += 3;
  else if (tightness >= 50) dryScore += 1.5;

  if (oilyScore >= 2.5 && dryScore >= 2.5) return "combination";
  if (oilyScore >= 3) return "oily";
  if (dryScore >= 3) return "dry";
  if (oilyScore > dryScore) return "oily";
  if (dryScore > oilyScore) return "dry";
  return "normal";
}

function buildFallbackPrediction(answers: Record<string, number>): MLPrediction {
  const skinType = fallbackClassify(answers);
  return {
    skin_type: skinType,
    confidence: 0.85,
    probabilities: { [skinType]: 0.85 },
    sensitive: answers.sensitivity_score >= 60,
    disagreement: false,
    final_scores: {
      sebum_level: answers.sebum_level,
      acne_frequency: answers.acne_frequency,
    },
    raw_debug: {
      quiz_oiliness: answers.sebum_level,
      image_oiliness: 0,
      quiz_acne: answers.acne_frequency,
      image_acne: 0,
    },
    concerns_detected: [],
  };
}

function defaultUserProfile(): UserProfile {
  return {
    age_range: null,
    gender: null,
    pregnant_or_breastfeeding: null,
    fragrance_preference: null,
    budget_range: null,
    allergies: null,
  };
}

function parseUserProfile(value: FormDataEntryValue | null): UserProfile {
  if (typeof value !== "string" || !value.trim()) return defaultUserProfile();

  const parsed = JSON.parse(value) as Record<string, unknown>;
  return {
    age_range: typeof parsed.age_range === "string" ? parsed.age_range : null,
    gender: typeof parsed.gender === "string" ? parsed.gender : null,
    pregnant_or_breastfeeding:
      typeof parsed.pregnant_or_breastfeeding === "boolean"
        ? parsed.pregnant_or_breastfeeding
        : null,
    fragrance_preference:
      typeof parsed.fragrance_preference === "string" ? parsed.fragrance_preference : null,
    budget_range: typeof parsed.budget_range === "string" ? parsed.budget_range : null,
    allergies: typeof parsed.allergies === "string" ? parsed.allergies : null,
  };
}

function isUploadedFile(value: FormDataEntryValue | null): value is File {
  return value !== null && typeof value !== "string" && typeof value.arrayBuffer === "function";
}

function rawScoresFromPrediction(
  prediction: MLPrediction,
  answers: Record<string, number>
): RawScores {
  return {
    quiz_oiliness: prediction.raw_debug?.quiz_oiliness ?? answers.sebum_level,
    image_oiliness: prediction.raw_debug?.image_oiliness ?? 0,
    final_oiliness: prediction.final_scores?.sebum_level ?? answers.sebum_level,
    quiz_acne: prediction.raw_debug?.quiz_acne ?? answers.acne_frequency,
    image_acne: prediction.raw_debug?.image_acne ?? 0,
    final_acne: prediction.final_scores?.acne_frequency ?? answers.acne_frequency,
  };
}

async function uploadAnalysisPhotos(
  files: Record<PhotoField, File>,
  buffers: Record<PhotoField, Buffer>,
  analysisId: string
): Promise<string[]> {
  const folderPath = `glowguide/analyses/${analysisId}`;
  const photoUrls: string[] = [];

  for (const [photoIndex, field] of PHOTO_FIELDS.entries()) {
    try {
      photoUrls[photoIndex] = await uploadImageBuffer(
        buffers[field],
        folderPath,
        String(photoIndex)
      );
    } catch (error) {
      console.error(`Cloudinary upload failed for ${field}:`, error);
      photoUrls[photoIndex] = "";
    }
  }

  return photoUrls;
}

async function clearOlderAnalysisPhotos(customerId: string, currentAnalysisId: string) {
  try {
    const snapshot = await db
      .collection("analyses")
      .where("customerId", "==", customerId)
      .orderBy("createdAt", "desc")
      .get();

    const previousAnalyses = snapshot.docs
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

function buildCallbackUrl(request: NextRequest, analysisId: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return `${siteUrl}/api/skin-analysis/callback`;

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}/api/skin-analysis/callback`;

  return `http://localhost:3000/api/skin-analysis/callback`;
}

export async function POST(request: NextRequest) {
  const authCheck = await authorize(request, ["CUSTOMER"]);
  if ("error" in authCheck) return authCheck.error;

  if (!process.env.ML_SERVICE_SECRET) {
    console.error("ML_SERVICE_SECRET is not configured");
    return NextResponse.json(
      {
        error: {
          code: "ML_SERVICE_SECRET_MISSING",
          message: "ML_SERVICE_SECRET must be configured before running skin analysis",
        },
      },
      { status: 500 }
    );
  }

  const customer = await getCustomerById(authCheck.uid);
  if (!customer) {
    return NextResponse.json(
      { error: { code: "CUSTOMER_NOT_FOUND", message: "Customer not found" } },
      { status: 404 }
    );
  }

  if (
    customer.subscriptionTier === "FREE" &&
    customer.analysisCount >= FREE_TIER_ANALYSIS_LIMIT
  ) {
    return NextResponse.json(
      {
        error: {
          code: "ANALYSIS_LIMIT_REACHED",
          message: `Free tier is limited to ${FREE_TIER_ANALYSIS_LIMIT} analyses. Upgrade to continue.`,
        },
        upgradeUrl: "/subscription",
      },
      { status: 403 }
    );
  }

  let formData: FormData;
  let parsedQuizAnswers: Record<string, number>;
  let userProfile: UserProfile;

  try {
    formData = await request.formData();
    const quizAnswersValue = formData.get("quizAnswers");
    if (typeof quizAnswersValue !== "string") {
      throw new Error("quizAnswers must be a JSON string");
    }
    parsedQuizAnswers = JSON.parse(quizAnswersValue);
    userProfile = parseUserProfile(formData.get("userProfile"));
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_BODY",
          message: `Invalid multipart form data: ${error instanceof Error ? error.message : "unknown error"}`,
        },
      },
      { status: 400 }
    );
  }

  const normalizedAnswers = normalizeQuizAnswers(parsedQuizAnswers);
  const skinNotesValue = formData.get("skinNotes");
  const skinNotes = typeof skinNotesValue === "string" ? skinNotesValue : null;
  const files = {} as Record<PhotoField, File>;
  const buffers = {} as Record<PhotoField, Buffer>;

  for (const field of PHOTO_FIELDS) {
    const value = formData.get(field);
    if (!isUploadedFile(value) || value.size === 0) {
      return NextResponse.json(
        { error: { code: "MISSING_IMAGE", message: `Missing image field: ${field}` } },
        { status: 400 }
      );
    }
    files[field] = value;
    buffers[field] = Buffer.from(await value.arrayBuffer());
  }

  if (FORCE_FALLBACK) {
    const prediction = buildFallbackPrediction(normalizedAnswers);
    const skinType = fallbackClassify(normalizedAnswers);
    const confidence = 0.85;
    const probabilities = { [skinType]: 0.85 };
    const rawScores = rawScoresFromPrediction(prediction, normalizedAnswers);
    const concerns = deriveConcerns({ quizAnswers: normalizedAnswers, keywords: [], skinType });
    const healthScore = calculateHealthScore(concerns, confidence);
    const routine = generateRoutine({ skinType, concerns });

    const analysisRef = db.collection("analyses").doc();
    const photoUrls = await uploadAnalysisPhotos(files, buffers, analysisRef.id);

    try {
      const analysis = await createAnalysis({
        id: analysisRef.id,
        customerId: customer.uid,
        quizAnswers: normalizedAnswers,
        skinNotes,
        photoUrls,
        userProfile,
        result: {
          skinType,
          concerns,
          healthScore,
          confidence,
          probabilities,
          routine,
          sensitive: normalizedAnswers.sensitivity_score >= 60,
          disagreement: false,
          rawScores,
        },
        source: "fallback",
        status: "completed",
      });

      await updateCustomer(customer.uid, {
        analysisCount: (customer.analysisCount ?? 0) + 1,
        skinProfile: { skinType, concerns: concerns.map((c) => c.name) },
      });
      await clearOlderAnalysisPhotos(customer.uid, analysis.id);

      return NextResponse.json({
        analysisId: analysis.id,
        status: "completed",
        skin_type: skinType,
        confidence,
        probabilities,
        sensitive: normalizedAnswers.sensitivity_score >= 60,
        disagreement: false,
        rawScores,
        concerns_detected: [],
        healthScore,
        concerns,
        routine,
        source: "fallback",
      });
    } catch (err) {
      console.error("Failed to persist fallback analysis:", err);
      return NextResponse.json(
        { error: { code: "SAVE_FAILED", message: "Failed to save analysis result" } },
        { status: 500 }
      );
    }
  }

  const analysisRef = db.collection("analyses").doc();
  const analysisId = analysisRef.id;
  const photoUrls = await uploadAnalysisPhotos(files, buffers, analysisId);

  try {
    await createAnalysis({
      id: analysisId,
      customerId: customer.uid,
      quizAnswers: normalizedAnswers,
      skinNotes,
      photoUrls,
      userProfile,
      result: {
        skinType: "normal",
        concerns: [],
        healthScore: 0,
        confidence: 0,
        probabilities: {},
        routine: { morning: [], night: [] },
        sensitive: false,
        disagreement: false,
        rawScores: {
          quiz_oiliness: 0,
          image_oiliness: 0,
          final_oiliness: 0,
          quiz_acne: 0,
          image_acne: 0,
          final_acne: 0,
        },
      },
      source: "ml-service",
      status: "pending",
    });
  } catch (err) {
    console.error("Failed to create pending analysis:", err);
    return NextResponse.json(
      { error: { code: "SAVE_FAILED", message: "Failed to initialize analysis" } },
      { status: 500 }
    );
  }

  const mlForm = new NodeFormData();
  for (const field of PHOTO_FIELDS) {
    mlForm.append(field, buffers[field], {
      filename: files[field].name || `${field}.jpg`,
      contentType: files[field].type || "application/octet-stream",
    });
  }
  mlForm.append("quiz_scores", JSON.stringify(normalizedAnswers));
  mlForm.append("analysis_id", analysisId);
  mlForm.append("callback_url", buildCallbackUrl(request, analysisId));
  if (skinNotes) mlForm.append("user_notes", skinNotes);

  try {
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze`, mlForm, {
      timeout: 15_000,
      headers: {
        ...mlForm.getHeaders(),
        "X-Internal-Secret": process.env.ML_SERVICE_SECRET,
      },
    });

    if (mlResponse.status !== 202) {
      console.warn(`[${analysisId}] ML service returned unexpected status ${mlResponse.status}`);
    }

    return NextResponse.json({
      analysisId,
      status: "processing",
    });
  } catch (error: any) {
    console.error(`[${analysisId}] ML service call failed, falling back to quiz-only:`, error?.message);

    const prediction = buildFallbackPrediction(normalizedAnswers);
    const skinType = fallbackClassify(normalizedAnswers);
    const confidence = 0.85;
    const probabilities = { [skinType]: 0.85 };
    const rawScores = rawScoresFromPrediction(prediction, normalizedAnswers);
    const concerns = deriveConcerns({ quizAnswers: normalizedAnswers, keywords: [], skinType });
    const healthScore = calculateHealthScore(concerns, confidence);
    const routine = generateRoutine({ skinType, concerns });

    try {
      const analysis = await createAnalysis({
        id: analysisId,
        customerId: customer.uid,
        quizAnswers: normalizedAnswers,
        skinNotes,
        photoUrls,
        userProfile,
        result: {
          skinType,
          concerns,
          healthScore,
          confidence,
          probabilities,
          routine,
          sensitive: normalizedAnswers.sensitivity_score >= 60,
          disagreement: false,
          rawScores,
        },
        source: "fallback",
        status: "completed",
      });

      await updateCustomer(customer.uid, {
        analysisCount: (customer.analysisCount ?? 0) + 1,
        skinProfile: { skinType, concerns: concerns.map((c) => c.name) },
      });
      await clearOlderAnalysisPhotos(customer.uid, analysis.id);

      return NextResponse.json({
        analysisId: analysis.id,
        status: "completed",
        skin_type: skinType,
        confidence,
        probabilities,
        sensitive: normalizedAnswers.sensitivity_score >= 60,
        disagreement: false,
        rawScores,
        concerns_detected: [],
        healthScore,
        concerns,
        routine,
        source: "fallback",
      });
    } catch (err) {
      console.error("Failed to persist fallback analysis:", err);
      return NextResponse.json(
        { error: { code: "SAVE_FAILED", message: "Failed to save analysis result" } },
        { status: 500 }
      );
    }
  }
}
