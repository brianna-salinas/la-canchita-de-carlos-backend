import type { UserRepository } from "../domain/model/ports/UserRepository.js";

// Analogo a uploadUserPhoto pero para quitar la foto de perfil (vuelve a
// mostrarse las iniciales, como cuando nunca se subio una).
export function makeRemoveUserPhoto(deps: { users: UserRepository }) {
  return async function removeUserPhoto(userId: number) {
    return deps.users.updatePhoto(userId, null);
  };
}
