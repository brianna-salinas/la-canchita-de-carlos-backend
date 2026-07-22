import type { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { HttpError } from "../errors/HttpError.js";

// Middleware final: centraliza el manejo de errores para no repetir try/catch
// con status codes en cada ruta.
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  // Errores de subida de archivos (multer): campo de form-data incorrecto, archivo muy
  // grande, etc. Sin esto caian al 500 generico y no se entendia la causa real.
  if (err instanceof MulterError) {
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res
        .status(400)
        .json({ error: `El campo del archivo enviado ("${err.field}") no coincide con el que espera este endpoint.` });
    }
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "El archivo supera el tamano maximo permitido." });
    }
    return res.status(400).json({ error: `Error al subir el archivo: ${err.message}` });
  }

  console.error(err);
  return res.status(500).json({ error: "Error interno del servidor." });
}
