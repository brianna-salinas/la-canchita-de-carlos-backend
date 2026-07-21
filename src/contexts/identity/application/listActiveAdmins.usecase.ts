import type { UserRepository } from "../domain/ports/UserRepository.js";

// RF27 / US26 — listar administradores activos (no expone pendientes ni rechazados).
export function makeListActiveAdmins(deps: { users: UserRepository }) {
  return function listActiveAdmins() {
    return deps.users.listActiveAdmins();
  };
}
