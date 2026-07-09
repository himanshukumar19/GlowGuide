import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/api-auth";
import { getProductById, updateProduct, deleteProduct } from "@/lib/models/product";
import { uploadImageBuffer } from "@/lib/cloudinary";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await getProductById(params.id);
    if (!product) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("getProductById error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch product" } },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await authorize(request, ["ADMIN"]);
    if ("error" in authCheck) return authCheck.error;

    const existing = await getProductById(params.id);
    if (!existing) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }

    const formData = await request.formData();

    const updateData: Record<string, any> = {};

    const imageFile = formData.get("imageFile") as File | null;
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const imageUrl = await uploadImageBuffer(buffer, params.id);
      updateData.image = imageUrl;
      updateData.images = [imageUrl];
    }

    const stringFields = ["name", "brand", "category", "subcategory", "description", "shortDescription", "howToUse", "volume"];
    const numberFields = ["price", "originalPrice", "discount", "rating", "reviewCount", "stockCount"];
    const arrayFields = ["keyBenefits", "ingredients", "skinTypes", "suitableFor", "concerns", "badges"];

    for (const field of stringFields) {
      const value = formData.get(field);
      if (value !== null && value !== "") updateData[field] = value as string;
    }

    for (const field of numberFields) {
      const value = formData.get(field);
      if (value !== null && value !== "") updateData[field] = Number(value);
    }

    for (const field of arrayFields) {
      const value = formData.get(field);
      if (value !== null && value !== "") {
        updateData[field] = JSON.parse(value as string);
      }
    }
    // image handled above via imageFile upload

    updateData.updatedAt = new Date().toISOString();

    await updateProduct(params.id, updateData);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("updateProduct error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update product" } },
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

    const product = await getProductById(params.id);
    if (!product) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Product not found" } },
        { status: 404 }
      );
    }

    await deleteProduct(params.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("deleteProduct error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete product" } },
      { status: 500 }
    );
  }
}
