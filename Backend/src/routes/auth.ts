import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { getCustomerById, createCustomer } from "../models";

const router = Router();

router.post("/customer", requireAuth, async (req: Request, res: Response) => {
  try {
    const { displayName, email, photoURL } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: { code: "INVALID_INPUT", message: "Email is required" } });
    }
    const uid = req.uid!;

    const existing = await getCustomerById(uid);
    if (existing) {
      return res.status(200).json({ message: "Customer already exists" });
    }

    const customer = await createCustomer(uid, { displayName, email, photoURL });
    return res.status(201).json({ message: "Customer created", customer });
  } catch (error: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to create customer" } });
  }
});

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const uid = req.uid!;
    const customer = await getCustomerById(uid);
    if (!customer) {
      return res.status(404).json({ error: { code: "CUSTOMER_NOT_FOUND", message: "Customer not found" } });
    }
    return res.json({ customer });
  } catch (error: any) {
    return res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Failed to fetch customer" } });
  }
});

export default router;
