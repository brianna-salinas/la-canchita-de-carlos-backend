import type { UserRepository } from "../domain/ports/UserRepository.js";
import type { SessionRepository } from "../domain/ports/SessionRepository.js";
import { hashPassword, verifyPassword } from "../../../platform/security/password.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

// TS07 / RF29 / US25 — cambiar la contrasena propia, validando la actual, e invalidando sesiones activas.
export function makeChangeOwnPassword(deps: { users: UserRepository; sessions: SessionRepository }) {
  return async function changeOwnPassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await deps.users.findByIdOrThrow(userId);

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, "La contrasena actual no es correcta.");
    }

    const newHash = await hashPassword(newPassword);
    await deps.users.updatePasswordHash(userId, newHash);
    await deps.sessions.revokeAllForUser(userId);

    return { updated: true };
  };
}
