import type { Request, Response, NextFunction } from "express";

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isOwner) {
    return res.status(403).json({ error: "Solo el administrador dueno puede realizar esta accion." });
  }
  next();
}
