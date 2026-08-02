import { NextRequest, NextResponse } from "next/server";
import { authorize } from "@/lib/api-auth";
import { getAllProducts, createProduct } from "@/lib/models/product";
import { uploadImageBuffer } from "@/lib/cloudinary";
import { type Product } from "@/lib/schemas";

export async function GET() {
  try {
    const products = await getAllProducts();
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("getAllProducts error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch products" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await authorize(request, ["ADMIN"]);
    if ("error" in authCheck) return authCheck.error;

    const formData = await request.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;

    if (!id || !name) {
      return NextResponse.json(
        { error: { code: "MISSING_FIELDS", message: "id and name are required" } },
        { status: 400 }
      );
    }

    let imageUrl = "";
    const imageFile = formData.get("imageFile") as File | null;
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageUrl = await uploadImageBuffer(buffer, `glowguide/products/${id}`, id);
    }

    const now = new Date().toISOString();

    const productData: Product = {
      id,
      name,
      brand: (formData.get("brand") as string) || "",
      category: formData.get("category") as Product["category"],
      subcategory: (formData.get("subcategory") as Product["subcategory"]) || undefined,
      price: Number(formData.get("price")) || 0,
      originalPrice: Number(formData.get("originalPrice")) || undefined,
      discount: Number(formData.get("discount")) || undefined,
      rating: Number(formData.get("rating")) || 0,
      reviewCount: Number(formData.get("reviewCount")) || 0,
      image: imageUrl,
      images: imageUrl ? [imageUrl] : [],
      description: (formData.get("description") as string) || "",
      shortDescription: (formData.get("shortDescription") as string) || "",
      keyBenefits: JSON.parse((formData.get("keyBenefits") as string) || "[]"),
      ingredients: JSON.parse((formData.get("ingredients") as string) || "[]"),
      howToUse: (formData.get("howToUse") as string) || "",
      skinTypes: JSON.parse((formData.get("skinTypes") as string) || "[]"),
      suitableFor: JSON.parse((formData.get("suitableFor") as string) || "[]"),
      concerns: JSON.parse((formData.get("concerns") as string) || "[]"),
      volume: (formData.get("volume") as string) || "",
      stockCount: Number(formData.get("stockCount")) || 0,
      badges: JSON.parse((formData.get("badges") as string) || "[]"),
      createdAt: now,
      updatedAt: now,
    };

    await createProduct(id, productData);

    return NextResponse.json({ success: true, product: productData }, { status: 201 });
  } catch (error: any) {
    console.error("createProduct error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create product" } },
      { status: 500 }
    );
  }
}
