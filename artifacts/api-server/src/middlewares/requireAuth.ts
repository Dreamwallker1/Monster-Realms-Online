import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth.js";

declare global {
  namespace Express {
    interface Request {
      playerId?: string;
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const token = authHeader.slice(7);
  const playerId = verifyToken(token);
  if (!playerId) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  req.playerId = playerId;
  next();
}
