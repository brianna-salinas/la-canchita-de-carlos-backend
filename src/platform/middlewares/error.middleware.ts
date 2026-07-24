import type { Request, Response, NextFunction } from "express";
import { MulterError } from "multer";
import { Prisma } from "../../../generated/prisma/client.js";
import { HttpError } from "../errors/HttpError.js";

const CAMPO_LEGIBLE: Record<string, string> = {
  cus_document_number: "el número de documento",
  usu_username: "el nombre de usuario",
  usu_email: "el correo",
};

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    const target = err.meta?.target;
    const columnas = Array.isArray(target) ? target : [String(target ?? "")];
    const legibles = columnas.map((c) => CAMPO_LEGIBLE[c] ?? c).join(", ");
    return res.status(409).json({ error: `Ya existe un registro con ese valor en ${legibles || "un campo único"}.` });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
    return res.status(409).json({
      error:
        "No se pudo eliminar: este registro todavia tiene datos relacionados (reservas, pagos o bloqueos) protegidos contra borrado. Si esto no deberia pasar, falta aplicar una migracion pendiente en la base de datos.",
    });
  }

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
