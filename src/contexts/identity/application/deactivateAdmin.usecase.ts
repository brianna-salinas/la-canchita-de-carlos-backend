import type { UserRepository } from "../domain/model/ports/UserRepository.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export function makeDeactivateAdmin(deps: { users: UserRepository }) {
  return async function deactivateAdmin(actingUserId: number, targetUserId: number) {
    if (actingUserId === targetUserId) {
      throw new HttpError(400, "Usa la opcion de eliminar tu propia cuenta para desactivarte a ti mismo.");
    }

    const target = await deps.users.findByIdOrThrow(targetUserId);

    if (target.isOwner) {
      const owners = await deps.users.countOwners();
      if (owners <= 1) {
        throw new HttpError(409, "No puedes desactivar al unico dueno del sistema.");
      }
    }

    return deps.users.deactivate(targetUserId);
  };
}
