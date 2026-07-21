import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../errors/HttpError.js";

// Middleware final: centraliza el manejo de errores para no repetir try/catch
// con status codes en cada ruta.
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor." });
}
