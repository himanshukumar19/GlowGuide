import { z } from "zod";

export const productCategoryEnum = z.enum([
  "men-women",
  "korean",
  "children",
  "senior",
  "laser-devices",
]);

export const productSubcategoryEnum = z.enum([
  "cleanser",
  "serum",
  "moisturizer",
  "sunscreen",
  "toner",
  "device",
  "kit",
  "lip-care",
  "mask",
]);

export const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  brand: z.string().min(1),
  category: productCategoryEnum,
  subcategory: productSubcategoryEnum.nullable().optional(),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative().nullable().optional(),
  discount: z.number().nonnegative().nullable().optional(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  image: z.string().min(1),
  images: z.array(z.string()).nullable().optional(),
  description: z.string().min(1),
  shortDescription: z.string().min(1),
  keyBenefits: z.array(z.string()),
  ingredients: z.array(z.string()),
  howToUse: z.string().min(1),
  skinTypes: z.array(z.string()).min(1),
  suitableFor: z.array(z.string()),
  concerns: z.array(z.string()),
  volume: z.string().min(1),
  stockCount: z.number().int().min(0),
  badges: z.array(z.string()).nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Product = z.infer<typeof productSchema>;
