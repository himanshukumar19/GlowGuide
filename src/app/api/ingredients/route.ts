import { NextResponse } from "next/server";
import { getAllIngredients } from "@/lib/models/ingredient";

export async function GET() {
  try {
    const ingredients = await getAllIngredients();
    return NextResponse.json(ingredients);
  } catch (error: any) {
    console.error("getAllIngredients error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch ingredients" } },
      { status: 500 }
    );
  }
}
