import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { subscriptionController } from "../controllers/subscription.controller";

const router = Router();

router.post("/create-order", requireAuth, subscriptionController.createOrder);
router.post("/verify", requireAuth, subscriptionController.verifyPayment);

export default router;
