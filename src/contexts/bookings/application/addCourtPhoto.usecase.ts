import type { CourtRepository } from "../domain/ports/CourtRepository.js";
import type { FileStorage } from "../../../platform/storage/ports/FileStorage.js";

// TS10 — subir una foto de una cancha (RF31).
export function makeAddCourtPhoto(deps: { courts: CourtRepository; storage: FileStorage }) {
  return async function addCourtPhoto(
    courtId: number,
    file: { buffer: Buffer; mimetype: string; originalname: string }
  ) {
    const result = await deps.storage.upload({
      folder: "canchas",
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });
    // Bucket "canchas" es publico: result.url siempre viene con valor aqui.
    return deps.courts.updatePhoto(courtId, result.url!);
  };
}
