import { MulterError } from "multer";
import { Prisma } from "../../../generated/prisma/client.js";
import { HttpError } from "../errors/HttpError.js";
const CAMPO_LEGIBLE = {
    cus_document_number: "el número de documento",
    usu_username: "el nombre de usuario",
    usu_email: "el correo",
};
// Middleware final: centraliza el manejo de errores para no repetir try/catch
// con status codes en cada ruta.
export function errorMiddleware(err, _req, res, _next) {
    if (err instanceof HttpError) {
        return res.status(err.status).json({ error: err.message });
    }
    // Antes una violacion de restriccion unica (ej. DNI repetido al crear un
    // cliente) no se manejaba en ningun lado: Prisma la lanzaba tal cual y caia
    // al 500 generico de mas abajo, sin mensaje util — desde la UI eso se veia
    // simplemente como "no funciona", sin pista de que el dato ya existia.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        const target = err.meta?.target;
        const columnas = Array.isArray(target) ? target : [String(target ?? "")];
        const legibles = columnas.map((c) => CAMPO_LEGIBLE[c] ?? c).join(", ");
        return res.status(409).json({ error: `Ya existe un registro con ese valor en ${legibles || "un campo único"}.` });
    }
    // Violacion de llave foranea (ej. borrar una cancha que todavia tiene
    // reservas/bloqueos/pagos ligados por FK con ON DELETE RESTRICT). Sin
    // esto caia al 500 generico "Error interno del servidor" sin ninguna
    // pista de la causa real. Lo mas probable es que falte aplicar la
    // migracion que cambia esas FK a ON DELETE CASCADE
    // (prisma/migrations/20260722180001_court_delete_cascade).
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
        return res.status(409).json({
            error: "No se pudo eliminar: este registro todavia tiene datos relacionados (reservas, pagos o bloqueos) protegidos contra borrado. Si esto no deberia pasar, falta aplicar una migracion pendiente en la base de datos.",
        });
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
//# sourceMappingURL=error.middleware.js.map