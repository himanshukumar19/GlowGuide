import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import NodeFormData from "form-data";
import { imageSize } from "image-size";
import { authorize } from "@/lib/api-auth";
import { updateCustomer, createAnalysis } from "@/lib/models";
import { validate } from "@/lib/validators";
import { customerSchema, type Customer } from "@/lib/schemas";
import { db } from "@/lib/firebase-admin";
import { uploadImageBuffer, deleteImage } from "@/lib/cloudinary";
import { buildQuizOnlyFallback } from "@/lib/analysis/fallbackClassifier";
import type { UserProfile } from "@/lib/schemas/analysis";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "https://glowguide-ml-service.onrender.com";
const FORCE_FALLBACK = process.env.FORCE_FALLBACK === "true";
const ML_REQUEST_TIMEOUT_MS = 60_000;
const FREE_TIER_ANALYSIS_LIMIT = 3;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MIN_IMAGE_DIMENSION = 480;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PHOTO_FIELDS = [
  "front",
  "left_profile",
  "right_profile",
  "forehead_closeup",
  "left_cheek_closeup",
  "right_cheek_closeup",
] as const;

type PhotoField = (typeof PHOTO_FIELDS)[number];

async function readAndValidatePhoto(file: File, field: PhotoField): Promise<Buffer> {
  const contentType = file.type.toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.has(contentType)) {
    throw new Error(`${field} must be a JPG, PNG, or WebP image`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length > MAX_IMAGE_BYTES) {
    throw new Error(`${field} exceeds the 8MB size limit`);
  }

  const hasMagicBytes =
    (contentType === "image/jpeg" && buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) ||
    (contentType === "image/png" && buffer.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"))) ||
    (contentType === "image/webp" && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP");

  if (!hasMagicBytes) {
    throw new Error(`${field} content does not match its MIME type`);
  }

  try {
    const dimensions = imageSize(buffer);
    if (
      !dimensions.width ||
      !dimensions.height ||
      dimensions.width < MIN_IMAGE_DIMENSION ||
      dimensions.height < MIN_IMAGE_DIMENSION
    ) {
      throw new Error(`${field} must be at least 480x480 pixels`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("must be at least")) throw error;
    throw new Error(`${field} is not a valid readable image`);
  }

  return buffer;
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

function buildCallbackUrl(request: NextRequest, analysisId: string): string {
  const siteUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL;
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

  const customerRef = db.collection("customers").doc(authCheck.uid);
  const customer = await db.runTransaction<Customer | { limitReached: true } | null>(
    async (tx) => {
      const doc = await tx.get(customerRef);
      if (!doc.exists) return null;

      const data = doc.data() as Record<string, unknown>;
      const tier = data.subscriptionTier;
      const count = (data.analysisCount as number | undefined) ?? 0;

      if (tier === "FREE" && count >= FREE_TIER_ANALYSIS_LIMIT) {
        return { limitReached: true };
      }

      tx.update(customerRef, {
        analysisCount: count + 1,
        updatedAt: new Date().toISOString(),
      });

      return validate(customerSchema, data);
    }
  );

  if (customer === null) {
    return NextResponse.json(
      { error: { code: "CUSTOMER_NOT_FOUND", message: "Customer not found" } },
      { status: 404 }
    );
  }

  if ("limitReached" in customer) {
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

  try {
    for (const field of PHOTO_FIELDS) {
      const value = formData.get(field);
      if (!isUploadedFile(value) || value.size === 0) {
        return NextResponse.json(
          { error: { code: "MISSING_IMAGE", message: `Missing image field: ${field}` } },
          { status: 400 }
        );
      }
      files[field] = value;
      buffers[field] = await readAndValidatePhoto(value, field);
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "INVALID_IMAGE",
          message: error instanceof Error ? error.message : "Invalid image upload",
        },
      },
      { status: 400 }
    );
  }

  if (FORCE_FALLBACK) {
    const result = buildQuizOnlyFallback(normalizedAnswers, userProfile);

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
        result,
        source: "fallback",
        status: "completed",
      });

      await updateCustomer(customer.uid, {
        skinProfile: { skinType: result.skinType, concerns: result.concerns.map((c) => c.name) },
      });
      await clearOlderAnalysisPhotos(customer.uid, analysis.id);

      return NextResponse.json({
        analysisId: analysis.id,
        status: "completed",
        skin_type: result.skinType,
        confidence: result.confidence,
        probabilities: result.probabilities,
        sensitive: result.sensitive,
        disagreement: result.disagreement,
        rawScores: result.rawScores,
        concerns_detected: [],
        healthScore: result.healthScore,
        concerns: result.concerns,
        routine: result.routine,
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
      // Render may need to wake the ML service before it can accept the request.
      // The service returns 202 before model inference starts.
      timeout: ML_REQUEST_TIMEOUT_MS,
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
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(`[${analysisId}] ML service request failed`, {
        url: `${ML_SERVICE_URL}/analyze`,
        code: error.code,
        status: error.response?.status,
        response: error.response?.data,
        message: error.message,
      });
    } else {
      console.error(`[${analysisId}] ML service request failed:`, error);
    }

    console.warn(`[${analysisId}] Falling back to quiz-only analysis`);

    const result = buildQuizOnlyFallback(normalizedAnswers, userProfile);

    try {
      const analysis = await createAnalysis({
        id: analysisId,
        customerId: customer.uid,
        quizAnswers: normalizedAnswers,
        skinNotes,
        photoUrls,
        userProfile,
        result,
        source: "fallback",
        status: "completed",
      });

      await updateCustomer(customer.uid, {
        skinProfile: { skinType: result.skinType, concerns: result.concerns.map((c) => c.name) },
      });
      await clearOlderAnalysisPhotos(customer.uid, analysis.id);

      return NextResponse.json({
        analysisId: analysis.id,
        status: "completed",
        skin_type: result.skinType,
        confidence: result.confidence,
        probabilities: result.probabilities,
        sensitive: result.sensitive,
        disagreement: result.disagreement,
        rawScores: result.rawScores,
        concerns_detected: [],
        healthScore: result.healthScore,
        concerns: result.concerns,
        routine: result.routine,
        source: "fallback",
      });
    } catch (err) {
      console.error("Failed to persist fallback analysis:", err);

      try {
        await db
          .collection("analyses")
          .doc(analysisId)
          .update({ status: "failed" });
        console.warn(`[${analysisId}] Pending analysis marked as failed`);
      } catch (cleanupError) {
        console.error(`[${analysisId}] Failed to mark pending analysis as failed:`, cleanupError);
      }

      return NextResponse.json(
        { error: { code: "SAVE_FAILED", message: "Failed to save analysis result" } },
        { status: 500 }
      );
    }
  }
}
