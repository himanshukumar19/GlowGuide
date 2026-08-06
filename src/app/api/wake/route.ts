import { NextResponse } from "next/server";
import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "https://glowguide-ml-service.onrender.com";

export async function GET() {
  try {
    await axios.get(ML_SERVICE_URL, { timeout: 60_000 });
    return NextResponse.json({ status: "ready", mlService: "ready" });
  } catch (error: unknown) {
    console.warn("ML service warm-up did not complete:", axios.isAxiosError(error) ? error.message : error);
    return NextResponse.json({ status: "ready", mlService: "starting" });
  }
}
