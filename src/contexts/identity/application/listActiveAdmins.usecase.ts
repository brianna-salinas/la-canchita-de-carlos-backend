import type { UserRepository } from "../domain/model/ports/UserRepository.js";

export function makeListActiveAdmins(deps: { users: UserRepository }) {
  return function listActiveAdmins() {
    return deps.users.listActiveAdmins();
  };
}
