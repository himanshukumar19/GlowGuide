import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/api-auth";
import { getIngredientById, updateIngredient, deleteIngredient } from "@/lib/models/ingredient";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await authorize(request, ["ADMIN"]);
    if ("error" in authCheck) return authCheck.error;

    const existing = await getIngredientById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Ingredient not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    await updateIngredient(params.id, body);
    const updated = await getIngredientById(params.id);
    return NextResponse.json({ success: true, ingredient: updated });
  } catch (error: any) {
    console.error("admin updateIngredient error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update ingredient" } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await authorize(request, ["ADMIN"]);
    if ("error" in authCheck) return authCheck.error;

    const existing = await getIngredientById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Ingredient not found" } },
        { status: 404 }
      );
    }

    await deleteIngredient(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("admin deleteIngredient error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete ingredient" } },
      { status: 500 }
    );
  }
}
