import "dotenv/config";

import { products } from "./product-data";
import { db } from "@/lib/firebase-admin";
import { uploadImageFile } from "@/lib/cloudinary";
import path from "path";
import fs from "fs";

const IMAGES_DIR = path.join(process.cwd(), "public", "images");

function sanitizeFileName(name: string): string {
  return name
    .replace(/%/g, " Percent")
    .replace(/\+/g, " Plus")
    .replace(/\s*&\s*/g, " and ");
}

async function uploadProductImage(
  productId: string,
  productName: string
): Promise<string | null> {
  const sanitized = sanitizeFileName(productName);
  const filePath = path.join(IMAGES_DIR, `${sanitized}.png`);

  if (!fs.existsSync(filePath)) {
    console.warn(`  ⚠ Image not found: ${path.basename(filePath)}`);
    return null;
  }

  try {
    const url = await uploadImageFile(
      filePath,
      `glowguide/products/${productId}`,
      productId
    );
    console.log(`  ✓ Uploaded: ${url}`);
    return url;
  } catch (err: any) {
    console.warn(`  ⚠ Cloudinary upload failed: ${err.message || "Unknown error"}`);
    return null;
  }
}

async function seed() {
  console.log("🌱 Seeding products to Firestore + Cloudinary...\n");

  let created = 0;
  let updated = 0;
  let skippedImages = 0;

  for (const product of products) {
    console.log(`📦 ${product.name}`);

    const imageUrl = await uploadProductImage(product.id, product.name);

    if (!imageUrl) {
      skippedImages++;
    }

    const now = new Date().toISOString();

    const existing = await db.collection("products").doc(product.id).get();

    if (existing.exists) {
      const existingData = existing.data() || {};

      const updatedData = {
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        subcategory: product.subcategory || null,
        price: product.price,
        originalPrice: product.originalPrice || null,
        discount: product.discount || null,
        rating: product.rating,
        reviewCount: product.reviewCount,
        image: imageUrl || existingData.image || "",
        images: [imageUrl || existingData.image || ""],
        description: product.description,
        shortDescription: product.shortDescription,
        keyBenefits: product.keyBenefits,
        ingredients: product.ingredients,
        howToUse: product.howToUse,
        skinTypes: product.skinTypes,
        suitableFor: product.suitableFor,
        concerns: product.concerns,
        volume: product.volume,
        stockCount: product.stockCount,
        badges: product.badges || null,
        createdAt: existingData.createdAt || now,
        updatedAt: now,
      };

      await db.collection("products").doc(product.id).set(updatedData);
      console.log(`  ↻ Updated product document`);
      updated++;
    } else {
      await db.collection("products").doc(product.id).set({
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        subcategory: product.subcategory || null,
        price: product.price,
        originalPrice: product.originalPrice || null,
        discount: product.discount || null,
        rating: product.rating,
        reviewCount: product.reviewCount,
        image: imageUrl || "",
        images: [imageUrl || ""],
        description: product.description,
        shortDescription: product.shortDescription,
        keyBenefits: product.keyBenefits,
        ingredients: product.ingredients,
        howToUse: product.howToUse,
        skinTypes: product.skinTypes,
        suitableFor: product.suitableFor,
        concerns: product.concerns,
        volume: product.volume,
        stockCount: product.stockCount,
        badges: product.badges || null,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`  ✓ Created product document`);
      created++;
    }
  }

  console.log(`\n✅ Done! Created: ${created}, Updated: ${updated}, Skipped images: ${skippedImages}`);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
