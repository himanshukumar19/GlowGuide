import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { verifyAuth } from "@/lib/auth";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

function fallbackClassify(answers: Record<string, number>): string {
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

export async function POST(request: NextRequest) {
  const authResult = await verifyAuth(request);
  if ("error" in authResult) {
    return authResult.error;
  }

  let body: { answers?: Record<string, number>; skinNotes?: string } = {};

  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { answers = {}, skinNotes } = body;

  const mlPayload = {
    quiz_answers: {
      sebum_level: answers.sebum_level,
      hydration_level: answers.hydration_level,
      acne_frequency: answers.acne_frequency,
      pore_size: answers.pore_size,
      sensitivity_score: answers.sensitivity_score,
      roughness_score: answers.roughness_score,
      tightness_score: answers.tightness_score,
    },
    skin_notes: skinNotes || null,
  };

  try {
    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/predict`,
      mlPayload,
      { timeout: 25_000 }
    );
    return NextResponse.json(mlResponse.data);
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
      const skinType = fallbackClassify(answers);
      return NextResponse.json({ skin_type: skinType, source: "fallback" });
    }

    console.error("ML Service 4xx error:", error.message);
    return NextResponse.json(
      {
        error: "ML prediction failed",
        detail: error.response?.data,
      },
      { status: error.response?.status || 500 }
    );
  }
}
