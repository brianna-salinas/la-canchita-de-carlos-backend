import type { CourtRepository } from "../domain/model/ports/CourtRepository.js";
import type { FileStorage } from "../../../platform/storage/ports/FileStorage.js";

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

    return deps.courts.updatePhoto(courtId, result.path);
  };
}
