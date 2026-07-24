import type { UserRepository } from "../domain/model/ports/UserRepository.js";
import type { SessionRepository } from "../domain/model/ports/SessionRepository.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export function makeDeactivateOwnAccount(deps: { users: UserRepository; sessions: SessionRepository }) {
  return async function deactivateOwnAccount(userId: number) {
    const user = await deps.users.findByIdOrThrow(userId);

    if (user.isOwner) {
      const owners = await deps.users.countOwners();
      if (owners <= 1) {
        throw new HttpError(409, "No puedes eliminar tu cuenta: eres el unico dueno del sistema.");
      }
    }

    const updated = await deps.users.deactivate(userId);
    await deps.sessions.revokeAllForUser(userId);
    return { id: updated.id, status: updated.status };
  };
}
