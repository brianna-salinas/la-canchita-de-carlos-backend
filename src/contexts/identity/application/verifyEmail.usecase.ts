import type { EmailVerificationTokenRepository } from "../domain/model/ports/EmailVerificationTokenRepository.js";
import { hashToken } from "../../../platform/security/tokens.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export function makeVerifyEmail(deps: { emailVerificationTokens: EmailVerificationTokenRepository }) {
  return async function verifyEmail(rawToken: string) {
    const tokenHash = hashToken(rawToken);
    const token = await deps.emailVerificationTokens.findByTokenHash(tokenHash);

    if (!token || token.used || token.expiresAt < new Date()) {
      throw new HttpError(400, "El enlace de verificacion es invalido o expiro. Solicita uno nuevo.");
    }

    await deps.emailVerificationTokens.markUsedAndActivateUser(token.id, token.userId);

    return { verified: true };
  };
}
