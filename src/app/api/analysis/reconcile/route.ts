import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { deleteImage } from "@/lib/cloudinary";
import { buildQuizOnlyFallback } from "@/lib/analysis/fallbackClassifier";
import { matchRoutineWithProducts } from "@/lib/analysis/productMatching";
import type { UserProfile } from "@/lib/schemas/analysis";

const RECONCILE_THRESHOLD_MS = 3 * 60 * 1000;

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  return Boolean(cronSecret) && request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

async function clearOlderAnalysisPhotos(
  customerId: string,
  currentAnalysisId: string
): Promise<boolean> {
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
      const deleteResults = await Promise.all(
        photoUrls.map(async (photoUrl, photoIndex) => {
          if (!photoUrl) return true;
          try {
            await deleteImage(folderPath, String(photoIndex));
            return true;
          } catch (error) {
            console.error(
              `Cloudinary delete failed for analysis ${document.id}, photo ${photoIndex}:`,
              error
            );
            return false;
          }
        })
      );
      if (deleteResults.some((deleted) => !deleted)) return false;
      await document.ref.update({ photoUrls: [] });
    }
    return true;
  } catch (error) {
    console.error("Failed to clean up older analysis photos:", error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const cutoff = new Date(now - RECONCILE_THRESHOLD_MS).toISOString();
  const snapshot = await db
    .collection("analyses")
    .where("status", "==", "pending")
    .where("createdAt", "<", cutoff)
    .get();

  const errors: string[] = [];
  let recovered = 0;

  for (const document of snapshot.docs) {
    const analysisId = document.id;
    const data = document.data();
    const customerId = String(data.customerId ?? "unknown");

    try {
      const quizAnswers = (data.quizAnswers ?? {}) as Record<string, number>;
      const userProfile = (data.userProfile ?? {}) as UserProfile;
      const fallbackResult = buildQuizOnlyFallback(quizAnswers, userProfile);
      const result = {
        ...fallbackResult,
        routine: await matchRoutineWithProducts(
          fallbackResult.routine,
          fallbackResult.concerns as { name: string }[],
          userProfile
        ),
      };
      const recoveredAt = new Date().toISOString();
      const stuckForMs = now - new Date(String(data.createdAt)).getTime();
      const customerRef = db.collection("customers").doc(customerId);
      const latestAnalysisQuery = db
        .collection("analyses")
        .where("customerId", "==", customerId)
        .orderBy("createdAt", "desc")
        .limit(1);
      if (!(await clearOlderAnalysisPhotos(customerId, analysisId))) {
        throw new Error("Failed to clean up older analysis photos");
      }
      const didRecover = await db.runTransaction(async (transaction) => {
        const currentSnapshot = await transaction.get(document.ref);
        const customerSnapshot = await transaction.get(customerRef);
        const latestAnalysisSnapshot = await transaction.get(latestAnalysisQuery);
        if (!currentSnapshot.exists || currentSnapshot.data()?.status !== "pending") return false;
        if (!customerSnapshot.exists) {
          throw new Error(`Customer ${customerId} not found`);
        }

        transaction.update(document.ref, {
          result,
          source: "fallback-recovery",
          status: "completed",
          recoveredAt,
        });
        const latestAnalysis = latestAnalysisSnapshot.docs[0];
        if (
          latestAnalysis?.id === analysisId ||
          latestAnalysis?.data().status !== "completed"
        ) {
          transaction.update(customerRef, {
            skinProfile: {
              skinType: result.skinType,
              concerns: result.concerns.map((concern) => concern.name),
            },
            updatedAt: recoveredAt,
          });
        }
        return true;
      });

      if (!didRecover) {
        console.warn(
          `[${analysisId}] Reconciliation skipped because analysis was completed concurrently`,
          { customerId }
        );
        continue;
      }

      recovered += 1;
      console.warn(`[${analysisId}] Pending analysis recovered with quiz-only fallback`, {
        customerId,
        stuckForMinutes: Math.round(stuckForMs / 60000),
        recoveredAt,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown recovery error";
      errors.push(`${analysisId}: ${message}`);
      console.error(`[${analysisId}] Pending analysis recovery failed`, {
        customerId,
        error,
      });
    }
  }

  return NextResponse.json({
    checked: snapshot.size,
    recovered,
    errors,
  });
}
