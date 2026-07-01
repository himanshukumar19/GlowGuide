import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { db } from "../config/firebase-admin";

const router = Router();

router.post("/customer", requireAuth, async (req: Request, res: Response) => {
  try {
    const { displayName, email, photoURL } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: { code: "INVALID_INPUT", message: "Email is required" } });
    }
    const uid = req.uid!;

    const existing = await db.collection("customers").doc(uid).get();
    if (existing.exists) {
      return res.status(200).json({ message: "Customer already exists" });
    }

    const customer = {
      uid,
      email,
      displayName: displayName || "",
      photoURL: photoURL || null,
      phone: "",
      role: "CUSTOMER",
      subscriptionTier: "FREE",
      subscriptionExpiresAt: null,
      analysisCount: 0,
      skinProfile: null,
      profileCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection("customers").doc(uid).set(customer);
    return res.status(201).json({ message: "Customer created", customer });
  } catch (error: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to create customer" } });
  }
});

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.uid!;
    const doc = await db.collection("customers").doc(uid).get();
    if (!doc.exists) {
      return res.status(404).json({ error: { code: "CUSTOMER_NOT_FOUND", message: "Customer not found" } });
    }
    return res.json({ customer: doc.data() });
  } catch (error: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch customer" } });
  }
});

export default router;
