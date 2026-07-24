import type { UserRepository } from "../domain/model/ports/UserRepository.js";
import type { SessionRepository } from "../domain/model/ports/SessionRepository.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

// US26-US30 — el propio usuario elimina (desactiva) su cuenta. Si es el unico
// owner activo, se bloquea para no dejar el sistema sin administrador con
// privilegios de dueno. Al desactivarse, se cierran sus sesiones (mismo
// patron que changeOwnPassword al rotar credenciales).
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
