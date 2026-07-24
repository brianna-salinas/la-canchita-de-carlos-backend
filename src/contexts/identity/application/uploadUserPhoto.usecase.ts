import type { UserRepository } from "../domain/model/ports/UserRepository.js";
import type { FileStorage } from "../../../platform/storage/ports/FileStorage.js";

export function makeUploadUserPhoto(deps: { users: UserRepository; storage: FileStorage }) {
  return async function uploadUserPhoto(
    userId: number,
    file: { buffer: Buffer; mimetype: string; originalname: string }
  ) {
    const result = await deps.storage.upload({
      folder: "perfiles",
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });

    return deps.users.updatePhoto(userId, result.path);
  };
}
