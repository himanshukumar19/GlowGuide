import { ZodSchema, ZodError } from "zod";

export class ValidationError extends Error {
  public details: Record<string, string[]>;
  constructor(errors: ZodError) {
    const flat = errors.flatten();
    super(flat.fieldErrors ? Object.values(flat.fieldErrors).flat().join("; ") : "Validation failed");
    this.details = flat.fieldErrors as Record<string, string[]>;
    this.name = "ValidationError";
  }
}

export function validate<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(result.error);
  }
  return result.data;
}
