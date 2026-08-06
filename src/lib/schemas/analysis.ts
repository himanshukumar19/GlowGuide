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
  concernContext: z.string().optional(),
  suggestedProducts: z.array(z.string()).optional(),
});

export type RoutineStep = z.infer<typeof routineStepSchema>;

export const routineRecommendationSchema = z.object({
  morning: z.array(routineStepSchema),
  night: z.array(routineStepSchema),
});

export type RoutineRecommendation = z.infer<typeof routineRecommendationSchema>;

export const userProfileSchema = z.object({
  age_range: z.string().nullable(),
  gender: z.string().nullable(),
  pregnant_or_breastfeeding: z.boolean().nullable(),
  fragrance_preference: z.string().nullable(),
  budget_range: z.string().nullable(),
  allergies: z.string().nullable(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

export const rawScoresSchema = z.object({
  quiz_oiliness: z.number(),
  image_oiliness: z.number(),
  final_oiliness: z.number(),
  quiz_acne: z.number(),
  image_acne: z.number(),
  final_acne: z.number(),
});

export type RawScores = z.infer<typeof rawScoresSchema>;

export const analysisResultSchema = z.object({
  skinType: skinTypeEnum,
  concerns: z.array(detectedConcernSchema),
  healthScore: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
  probabilities: z.record(z.string(), z.number().min(0).max(1)),
  routine: routineRecommendationSchema,
  sensitive: z.boolean().default(false),
  disagreement: z.boolean().default(false),
  rawScores: rawScoresSchema.default({
    quiz_oiliness: 0,
    image_oiliness: 0,
    final_oiliness: 0,
    quiz_acne: 0,
    image_acne: 0,
    final_acne: 0,
  }),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export const analysisSourceEnum = z.enum(["ml-service", "fallback", "fallback-recovery"]);

export type AnalysisSource = z.infer<typeof analysisSourceEnum>;

export const analysisStatusEnum = z.enum(["pending", "processing", "completed", "failed"]);

export type AnalysisStatus = z.infer<typeof analysisStatusEnum>;

export const analysisSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  quizAnswers: z.record(z.string(), z.number()),
  skinNotes: z.string().nullable(),
  photoUrls: z.array(z.string()),
  userProfile: userProfileSchema.default({
    age_range: null,
    gender: null,
    pregnant_or_breastfeeding: null,
    fragrance_preference: null,
    budget_range: null,
    allergies: null,
  }),
  result: analysisResultSchema,
  source: analysisSourceEnum,
  status: analysisStatusEnum.default("completed"),
  recoveredAt: z.string().optional(),
  createdAt: z.string(),
});

export type Analysis = z.infer<typeof analysisSchema>;
