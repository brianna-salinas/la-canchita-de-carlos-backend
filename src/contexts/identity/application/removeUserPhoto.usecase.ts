import type { UserRepository } from "../domain/model/ports/UserRepository.js";

export function makeRemoveUserPhoto(deps: { users: UserRepository }) {
  return async function removeUserPhoto(userId: number) {
    return deps.users.updatePhoto(userId, null);
  };
}
