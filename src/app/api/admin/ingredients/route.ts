import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/api-auth";
import {
  getAllIngredients,
  createIngredient,
} from "@/lib/models/ingredient";

export async function GET(request: NextRequest) {
  try {
    const authCheck = await authorize(request, ["ADMIN"]);
    if ("error" in authCheck) return authCheck.error;

    const ingredients = await getAllIngredients();
    return NextResponse.json(ingredients);
  } catch (error: any) {
    console.error("admin listIngredients error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch ingredients" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await authorize(request, ["ADMIN"]);
    if ("error" in authCheck) return authCheck.error;

    const body = await request.json();
    const { name, description, benefits, sideEffects, suitableSkinTypes, category, safetyRating } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: { code: "MISSING_FIELDS", message: "name and category are required" } },
        { status: 400 }
      );
    }

    const ingredient = await createIngredient({
      name,
      description: description || "",
      benefits: benefits || [],
      sideEffects: sideEffects || [],
      suitableSkinTypes: suitableSkinTypes || [],
      category,
      safetyRating: safetyRating || undefined,
    });

    return NextResponse.json({ success: true, ingredient }, { status: 201 });
  } catch (error: any) {
    console.error("admin createIngredient error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create ingredient" } },
      { status: 500 }
    );
  }
}
