import { z } from "zod";

export const skinTypeEnum = z.enum([
  "oily",
  "dry",
  "combination",
  "sensitive",
  "normal",
]);

export type SkinType = z.infer<typeof skinTypeEnum>;

export const detectedConcernSchema = z.object({
  name: z.string(),
  confidence: z.number().min(0).max(1),
  description: z.string(),
  severity: z.number().min(0).max(100),
});

export type DetectedConcern = z.infer<typeof detectedConcernSchema>;

export const routineStepSchema = z.object({
  productType: z.string(),
  description: z.string(),
  suggestedProducts: z.array(z.string()).optional(),
});

export type RoutineStep = z.infer<typeof routineStepSchema>;

export const routineRecommendationSchema = z.object({
  morning: z.array(routineStepSchema),
  night: z.array(routineStepSchema),
});

export type RoutineRecommendation = z.infer<typeof routineRecommendationSchema>;

export const analysisResultSchema = z.object({
  skinType: skinTypeEnum,
  concerns: z.array(detectedConcernSchema),
  healthScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  probabilities: z.record(z.string(), z.number().min(0).max(1)),
  routine: routineRecommendationSchema,
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export const analysisSourceEnum = z.enum(["ml-service", "fallback"]);

export type AnalysisSource = z.infer<typeof analysisSourceEnum>;

export const analysisSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  quizAnswers: z.record(z.string(), z.number()),
  skinNotes: z.string().nullable(),
  photoUrls: z.array(z.string()),
  result: analysisResultSchema,
  source: analysisSourceEnum,
  createdAt: z.string(),
});

export type Analysis = z.infer<typeof analysisSchema>;
