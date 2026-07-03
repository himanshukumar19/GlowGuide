import { api } from "./client";
import type {
  Analysis,
  DetectedConcern,
  RoutineRecommendation,
  SkinType,
  AnalysisSource,
} from "@/lib/schemas/analysis";

export interface CreateAnalysisPayload {
  answers: Record<string, number>;
  skinNotes?: string | null;
}

export interface CreateAnalysisResponse {
  analysisId: string;
  skin_type: SkinType;
  confidence: number;
  probabilities: Record<string, number>;
  concerns_detected: string[];
  healthScore: number;
  concerns: DetectedConcern[];
  routine: RoutineRecommendation;
  source: AnalysisSource;
}

export interface AnalysisHistoryItem {
  id: string;
  date: string;
  healthScore: number;
  skinType: SkinType;
  confidence: number;
  concerns: { name: string; severity: number }[];
  notes?: string;
  routine: RoutineRecommendation;
}

export interface AnalysisHistoryResponse {
  items: AnalysisHistoryItem[];
  total: number;
  limit: number;
  hasMore: boolean;
}

export const analysisApi = {
  create: (payload: CreateAnalysisPayload) =>
    api.post<CreateAnalysisResponse>("/api/skin-analysis", payload),

  getHistory: (limit?: number) =>
    api.get<AnalysisHistoryResponse>(
      `/api/analysis${limit ? `?limit=${limit}` : ""}`
    ),

  getById: (id: string) => api.get<Analysis>(`/api/analysis/${id}`),
};
