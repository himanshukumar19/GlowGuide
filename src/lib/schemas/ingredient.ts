import { z } from "zod";

export const ingredientSafetyRatingEnum = z.enum(["safe", "moderate", "caution"]);

export const ingredientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  benefits: z.array(z.string()),
  sideEffects: z.array(z.string()),
  suitableSkinTypes: z.array(z.string()).min(1),
  category: z.string().min(1),
  safetyRating: ingredientSafetyRatingEnum.optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Ingredient = z.infer<typeof ingredientSchema>;
