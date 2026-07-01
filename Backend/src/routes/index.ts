import { Router } from "express";
import authRoutes from "./auth";
import subscriptionRoutes from "./subscriptions";

const router = Router();

router.use("/auth", authRoutes);
router.use("/subscriptions", subscriptionRoutes);

export default router;
