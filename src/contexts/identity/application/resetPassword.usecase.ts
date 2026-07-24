import type { PasswordResetTokenRepository } from "../domain/model/ports/PasswordResetTokenRepository.js";
import type { SessionRepository } from "../domain/model/ports/SessionRepository.js";
import { hashToken } from "../../../platform/security/tokens.js";
import { hashPassword } from "../../../platform/security/password.js";
import { assertMinLength } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

// Confirma el reseteo de contraseña con el token recibido por correo.
// Invalida todas las sesiones activas del usuario tras el cambio, igual que
// changeOwnPassword.
export function makeResetPassword(deps: {
  passwordResetTokens: PasswordResetTokenRepository;
  sessions: SessionRepository;
}) {
  return async function resetPassword(rawToken: string, newPassword: string) {
    try {
      assertMinLength(newPassword, 8, "La nueva contraseña");
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    const tokenHash = hashToken(rawToken);
    const token = await deps.passwordResetTokens.findByTokenHash(tokenHash);

    if (!token || token.used || token.expiresAt < new Date()) {
      throw new HttpError(400, "El enlace para restablecer tu contraseña es inválido o expiró. Solicita uno nuevo.");
    }

    const newHash = await hashPassword(newPassword);
    await deps.passwordResetTokens.markUsedAndUpdatePassword(token.id, token.userId, newHash);
    await deps.sessions.revokeAllForUser(token.userId);

    return { reset: true };
  };
}
