import { Request, Response, NextFunction } from "express";
import { auth } from "../config/firebase-admin";

declare global {
  namespace Express {
    interface Request {
      uid?: string;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: { code: "MISSING_TOKEN", message: "Missing or invalid token" } });
  }
  try {
    const token = header.split("Bearer ")[1]!;
    const decoded = await auth.verifyIdToken(token);
    req.uid = decoded.uid;
    next();
  } catch {
    return res.status(401).json({ error: { code: "INVALID_TOKEN", message: "Invalid or expired token" } });
  }
};
