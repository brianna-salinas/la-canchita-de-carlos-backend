import type { UserRepository } from "../domain/model/ports/UserRepository.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

// Owner es un rol, no un singleton: cualquier owner existente puede ascender a otro
// administrador activo a owner (protegido por requireOwner en el adaptador HTTP).
export function makePromoteToOwner(deps: { users: UserRepository }) {
  return async function promoteToOwner(userId: number) {
    const user = await deps.users.findByIdOrThrow(userId);
    if (user.status !== "ACTIVE") {
      throw new HttpError(409, "Solo se puede ascender a owner a una cuenta activa.");
    }
    const updated = await deps.users.promoteToOwner(userId);
    return { id: updated.id, name: updated.name, email: updated.email, isOwner: updated.isOwner };
  };
}
