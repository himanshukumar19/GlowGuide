import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { authorize } from "@/lib/api-auth";
import { getCustomerById, updateCustomer } from "@/lib/models";
import { createAnalysis } from "@/lib/models";
import { calculateHealthScore } from "@/lib/analysis/health-score";
import { deriveConcerns } from "@/lib/analysis/concerns";
import { generateRoutine } from "@/lib/analysis/routine";
import type { AnalysisSource, SkinType } from "@/lib/schemas/analysis";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const FORCE_FALLBACK = process.env.FORCE_FALLBACK === "true";

const FREE_TIER_ANALYSIS_LIMIT = 3;

interface MLPrediction {
  skin_type: SkinType;
  confidence?: number;
  probabilities?: Record<string, number>;
  concerns_detected?: string[];
}

function normalizeQuizAnswers(
  answers: Record<string, number>
): Record<string, number> {
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
  const s = answers.sebum_level ?? 50;
  const h = answers.hydration_level ?? 50;
  const sn = answers.sensitivity_score ?? 30;
  const t = answers.tightness_score ?? 30;

  if (sn >= 68) return "sensitive";
  if (s >= 65 && h >= 45 && t <= 30) return "oily";
  if (s >= 55) return "combination";
  if (h <= 36 || t >= 70) return "dry";
  return "normal";
}

function buildFallbackPrediction(answers: Record<string, number>): MLPrediction {
  const skinType = fallbackClassify(answers);
  return {
    skin_type: skinType,
    confidence: 0.85,
    probabilities: { [skinType]: 0.85 },
    concerns_detected: [],
  };
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
    normalized[key] = Math.max(0, Math.min(1, value));
  }
  return normalized;
}

function isValidSkinType(value: string): value is SkinType {
  return ["oily", "dry", "combination", "sensitive", "normal"].includes(value);
}

export async function POST(request: NextRequest) {
  const authCheck = await authorize(request, ["CUSTOMER"]);
  if ("error" in authCheck) {
    return authCheck.error;
  }

  const customer = await getCustomerById(authCheck.uid);
  if (!customer) {
    return NextResponse.json(
      { error: { code: "CUSTOMER_NOT_FOUND", message: "Customer not found" } },
      { status: 404 }
    );
  }

  // Free-tier enforcement
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

  let body: { answers?: Record<string, number>; skinNotes?: string } = {};

  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json(
      { error: { code: "INVALID_BODY", message: "Invalid JSON body" } },
      { status: 400 }
    );
  }

  const { answers = {}, skinNotes } = body;
  const normalizedAnswers = normalizeQuizAnswers(answers);

  const mlPayload = {
    quiz_answers: {
      sebum_level: normalizedAnswers.sebum_level,
      hydration_level: normalizedAnswers.hydration_level,
      acne_frequency: normalizedAnswers.acne_frequency,
      pore_size: normalizedAnswers.pore_size,
      sensitivity_score: normalizedAnswers.sensitivity_score,
      roughness_score: normalizedAnswers.roughness_score,
      tightness_score: normalizedAnswers.tightness_score,
    },
    skin_notes: skinNotes || null,
  };

  let prediction: MLPrediction;
  let source: AnalysisSource = "ml-service";

  if (FORCE_FALLBACK) {
    prediction = buildFallbackPrediction(normalizedAnswers);
    source = "fallback";
  } else {
    try {
      const mlResponse = await axios.post<MLPrediction>(
        `${ML_SERVICE_URL}/predict`,
        mlPayload,
        { timeout: 25_000 }
      );
      prediction = mlResponse.data;
    } catch (error: any) {
      const isMLError =
        !error.response ||
        error.response?.status >= 500 ||
        error.response?.status === 429 ||
        error.code === "ECONNABORTED";

      if (isMLError) {
        console.warn(
          "ML Service unavailable, using fallback classifier:",
          error?.message
        );
        prediction = buildFallbackPrediction(normalizedAnswers);
        source = "fallback";
      } else {
        console.error("ML Service 4xx error:", error.message);
        return NextResponse.json(
          {
            error: {
              code: "ML_PREDICTION_FAILED",
              message: "ML prediction failed",
            },
            detail: error.response?.data,
          },
          { status: error.response?.status || 500 }
        );
      }
    }
  }

  const skinType = isValidSkinType(prediction.skin_type)
    ? prediction.skin_type
    : fallbackClassify(normalizedAnswers);

  const confidence = Math.max(0, Math.min(1, prediction.confidence ?? 0.85));
  const probabilities = normalizeProbabilities(prediction.probabilities, skinType);
  const keywords = prediction.concerns_detected ?? [];

  const concerns = deriveConcerns({
    quizAnswers: normalizedAnswers,
    keywords,
    skinType,
  });

  const healthScore = calculateHealthScore(concerns, confidence);
  const routine = generateRoutine({ skinType, concerns });

  try {
    const analysis = await createAnalysis({
      customerId: customer.uid,
      quizAnswers: normalizedAnswers,
      skinNotes: skinNotes || null,
      photoUrls: [],
      result: {
        skinType,
        concerns,
        healthScore,
        confidence,
        probabilities,
        routine,
      },
      source,
    });

    await updateCustomer(customer.uid, {
      analysisCount: (customer.analysisCount ?? 0) + 1,
      skinProfile: {
        skinType,
        concerns: concerns.map((c) => c.name),
      },
    });

    return NextResponse.json({
      analysisId: analysis.id,
      skin_type: skinType,
      confidence,
      probabilities,
      concerns_detected: keywords,
      healthScore,
      concerns,
      routine,
      source,
    });
  } catch (err) {
    console.error("Failed to persist analysis:", err);
    return NextResponse.json(
      {
        error: {
          code: "SAVE_FAILED",
          message: "Failed to save analysis result",
        },
      },
      { status: 500 }
    );
  }
}
