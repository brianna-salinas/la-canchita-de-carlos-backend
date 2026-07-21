import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../security/jwt.js";

// Protege cualquier endpoint que requiera sesion iniciada (US03: ningun dato del
// negocio es accesible sin sesion valida).
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autenticado." });
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { userId: payload.userId, isOwner: payload.isOwner };
    next();
  } catch {
    return res.status(401).json({ error: "Sesion invalida o expirada." });
  }
}
