import type { UserRepository } from "../domain/model/ports/UserRepository.js";
import type { FileStorage } from "../../../platform/storage/ports/FileStorage.js";

export function makeRemoveUserPhoto(deps: { users: UserRepository; storage: FileStorage }) {
  return async function removeUserPhoto(userId: number) {
    const user = await deps.users.findByIdOrThrow(userId);
    const updated = await deps.users.updatePhoto(userId, null);

    if (user.photoUrl) {
      try {
        await deps.storage.delete(user.photoUrl);
      } catch {}
    }

    return updated;
  };
}
