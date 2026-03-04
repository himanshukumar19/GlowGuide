import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3001;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*"}));
app.use(express.json());

app.get("/api/health", (_req, res)=>{
    res.json({ status: "ok", service: "GlowGuide Backend" });
})

app.post("/api/skin-analysis", async (req, res) => {
  try {
    const { answers, skinNotes } = req.body;

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

    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, mlPayload);
    res.json(mlResponse.data);

  } catch (error: any) {
    console.error("ML Service error:", error.message);

    if (error.response) {
      res.status(error.response.status).json({
        error: "ML prediction failed",
        detail: error.response.data,
      });
    } else {
      res.status(503).json({
        error: "ML Service unavailable",
        detail: "Could not connect to ML service",
      });
    }
  }
});

app.listen(PORT, () => {
    console.log(`GlowGuide Backend running on port http://localhost:${PORT}`);
    console.log(`ML Service URL: ${ML_SERVICE_URL}`);
})