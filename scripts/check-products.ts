import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "@/lib/firebase-admin";

async function check() {
  const snapshot = await db.collection("products").get();
  console.log(`Total products in Firestore: ${snapshot.size}\n`);

  const docs = snapshot.docs.slice(0, 3);
  for (const doc of docs) {
    const data = doc.data();
    console.log(`--- ${data.name} ---`);
    console.log(`  ID: ${data.id}`);
    console.log(`  Price: ₹${data.price}`);
    console.log(`  Stock: ${data.stockCount}`);
    console.log(`  Category: ${data.category}`);
    console.log(`  Image URL: "${data.image}"`);
    console.log(`  Images array: ${JSON.stringify(data.images)}`);
    console.log();
  }

  const withImages = snapshot.docs.filter((d) => d.data().image && d.data().image.length > 0);
  const withoutImages = snapshot.docs.filter((d) => !d.data().image || d.data().image.length === 0);
  console.log(`Products with image URL: ${withImages.length}`);
  console.log(`Products without image URL: ${withoutImages.length}`);
}

check().catch(console.error);
