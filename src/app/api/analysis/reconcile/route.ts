import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { buildQuizOnlyFallback } from "@/lib/analysis/fallbackClassifier";
import type { UserProfile } from "@/lib/schemas/analysis";

const RECONCILE_THRESHOLD_MS = 3 * 60 * 1000;

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  return Boolean(cronSecret) && request.headers.get("authorization") === `Bearer ${cronSecret}`;
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
      const result = buildQuizOnlyFallback(quizAnswers, userProfile);
      const recoveredAt = new Date().toISOString();
      const stuckForMs = now - new Date(String(data.createdAt)).getTime();
      const customerRef = db.collection("customers").doc(customerId);
      const latestAnalysisQuery = db
        .collection("analyses")
        .where("customerId", "==", customerId)
        .orderBy("createdAt", "desc")
        .limit(1);
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
