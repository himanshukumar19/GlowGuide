import "dotenv/config";

import { auth, db } from "@/lib/firebase-admin";

async function createAdmin() {
  const email = "admin@glowguide.com";
  const password = "GlowGuide2026!";

  const user = await auth.createUser({
    email,
    password,
    displayName: "GlowGuide Admin",
  });

  await db.collection("customers").doc(user.uid).set({
    uid: user.uid,
    email,
    displayName: "GlowGuide Admin",
    photoURL: null,
    phone: "",
    role: "ADMIN",
    subscriptionTier: "FREE",
    subscriptionStatus: null,
    subscriptionExpiresAt: null,
    subscriptionStartedAt: null,
    subscriptionCancelledAt: null,
    subscriptionPlanId: null,
    analysisCount: 0,
    skinProfile: null,
    profileCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await auth.setCustomUserClaims(user.uid, { role: "ADMIN" });

  console.log(`Admin created successfully!`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`UID: ${user.uid}`);
}

createAdmin().catch((err) => {
  console.error("Failed to create admin:", err);
  process.exit(1);
});
