import type { UserRepository } from "../domain/model/ports/UserRepository.js";
import type { PasswordResetTokenRepository } from "../domain/model/ports/PasswordResetTokenRepository.js";
import type { NotificationSender } from "../../notifications/application/ports/NotificationSender.js";
import { generateRawToken, hashToken, tokenExpiryFromNow } from "../../../platform/security/tokens.js";

export function makeRequestPasswordReset(deps: {
  users: UserRepository;
  passwordResetTokens: PasswordResetTokenRepository;
  notifier: NotificationSender;
}) {
  return async function requestPasswordReset(email: string) {
    const user = await deps.users.findByEmail(email);

    if (user && user.status === "ACTIVE") {
      const rawToken = generateRawToken();
      const tokenHash = hashToken(rawToken);
      const expiresAt = tokenExpiryFromNow(1);

      await deps.passwordResetTokens.create({ userId: user.id, tokenHash, expiresAt });
      await deps.notifier.sendPasswordReset({ to: user.email, name: user.name, rawToken });
    }

    return { sent: true };
  };
}
