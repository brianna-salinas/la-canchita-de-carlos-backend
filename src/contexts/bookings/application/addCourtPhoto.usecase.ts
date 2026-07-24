import type { CourtRepository } from "../domain/model/ports/CourtRepository.js";
import type { FileStorage } from "../../../platform/storage/ports/FileStorage.js";

export function makeAddCourtPhoto(deps: { courts: CourtRepository; storage: FileStorage }) {
  return async function addCourtPhoto(
    courtId: number,
    file: { buffer: Buffer; mimetype: string; originalname: string }
  ) {
    const previous = await deps.courts.findByIdOrThrow(courtId);

    const result = await deps.storage.upload({
      folder: "canchas",
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });

    const updated = await deps.courts.updatePhoto(courtId, result.path);

    if (previous.photoUrl && previous.photoUrl !== result.path) {
      try {
        await deps.storage.delete(previous.photoUrl);
      } catch {}
    }

    return updated;
  };
}
