import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3001;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// ── Rule-based fallback classifier ───────────────────────────────────────────
// Uses the same 7 quiz features as the ML model. Runs instantly when the ML
// service is unavailable (cold start, rate-limit, timeout, etc.).
// Feature ranges come from quizData.ts option values (0-100 scale).
function fallbackClassify(answers: Record<string, number>): string {
  const s  = answers.sebum_level      ?? 50;  // 10-95  (higher = oilier)
  const h  = answers.hydration_level  ?? 50;  // 10-90  (higher = more hydrated)
  const sn = answers.sensitivity_score ?? 30; // 15-85  (higher = more sensitive)
  const t  = answers.tightness_score  ?? 30;  // 10-90  (higher = tighter/drier)

  // Priority 1 — strong sensitivity overrides other signals
  if (sn >= 68) return "sensitive";

  // Priority 2 — clearly oily (high sebum, well-hydrated, no tightness)
  if (s >= 65 && h >= 45 && t <= 30) return "oily";

  // Priority 3 — oily T-zone with some dryness = combination
  if (s >= 55) return "combination";

  // Priority 4 — low hydration or high tightness = dry
  if (h <= 36 || t >= 70) return "dry";

  return "normal";
}

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*"}));
app.use(express.json());

app.get("/api/health", (_req, res)=>{
    return res.json({ status: "ok", service: "GlowGuide Backend" });
})

// Wake-up endpoint — frontend calls this on quiz-page mount.
// We only confirm the backend is alive here; we do NOT ping the ML service
// because that wastes the ML service's free-tier rate-limit quota.
app.get("/api/wake", (_req, res) => {
  return res.json({ status: "ready" });
})

app.post("/api/skin-analysis", async (req, res) => {
  const { answers, skinNotes } = req.body;
  try {

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

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, mlPayload, {
      // 25 s — short enough to leave time for the fallback within Vercel's 60 s limit
      timeout: 25_000,
    });
    return res.json(mlResponse.data);

  } catch (error: any) {
    // If the ML call itself failed (timeout, 429, 502 from Render, etc.),
    // use the rule-based fallback so the user always gets a result.
    const isMLError = !error.response || error.response?.status >= 500 || error.code === "ECONNABORTED";
    if (isMLError) {
      console.warn("ML Service unavailable, using fallback classifier:", error?.message);
      const skinType = fallbackClassify(answers);
      return res.json({ skin_type: skinType, source: "fallback" });
    }

    // 4xx from ML service (bad request, etc.) — surface it
    console.error("ML Service 4xx error:", error.message);
    return res.status(error.response.status).json({
      error: "ML prediction failed",
      detail: error.response.data,
    });
  }
});

app.listen(PORT, () => {
    console.log(`GlowGuide Backend running on port http://localhost:${PORT}`);
    console.log(`ML Service URL: ${ML_SERVICE_URL}`);
})