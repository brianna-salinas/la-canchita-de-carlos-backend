import type { UserRepository } from "../domain/ports/UserRepository.js";
import type { SessionRepository } from "../domain/ports/SessionRepository.js";
import { hashPassword, verifyPassword } from "../../../platform/security/password.js";
import { assertMinLength } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

// TS07 / RF29 / US25 — cambiar la contraseña propia, validando la actual, e invalidando sesiones activas.
export function makeChangeOwnPassword(deps: { users: UserRepository; sessions: SessionRepository }) {
  return async function changeOwnPassword(userId: number, currentPassword: string, newPassword: string) {
    try {
      assertMinLength(newPassword, 8, "La nueva contraseña");
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    const user = await deps.users.findByIdOrThrow(userId);

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw new HttpError(401, "La contraseña actual no es correcta.");
    }

    const newHash = await hashPassword(newPassword);
    await deps.users.updatePasswordHash(userId, newHash);
    await deps.sessions.revokeAllForUser(userId);

    return { updated: true };
  };
}
