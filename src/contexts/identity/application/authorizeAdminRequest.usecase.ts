import type { UserRepository } from "../domain/model/ports/UserRepository.js";
import type { AccessRequestRepository } from "../domain/model/ports/AccessRequestRepository.js";
import type { EmailVerificationTokenRepository } from "../domain/model/ports/EmailVerificationTokenRepository.js";
import type { NotificationSender } from "../../notifications/application/ports/NotificationSender.js";
import { assertPending } from "../domain/model/aggregates/AccessRequest.js";
import { usernameFromEmail } from "../domain/model/aggregates/User.js";
import { generateRawToken, hashToken, tokenExpiryFromNow } from "../../../platform/security/tokens.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

// TS05 / US21 — autorizar una solicitud pendiente (solo dueno, requireOwner en el adaptador HTTP).
// Crea el User en PENDING_VERIFICATION y dispara el correo de verificacion (RF34).
export function makeAuthorizeAdminRequest(deps: {
  users: UserRepository;
  accessRequests: AccessRequestRepository;
  emailVerificationTokens: EmailVerificationTokenRepository;
  notifier: NotificationSender;
}) {
  return async function authorizeAdminRequest(requestId: number) {
    const request = await deps.accessRequests.findByIdOrThrow(requestId);
    try {
      assertPending(request);
    } catch (e) {
      throw new HttpError(409, (e as Error).message);
    }

    // Si el correo de la solicitud pertenece a una cuenta previamente
    // desactivada, se reactiva esa misma fila (mismo id/username, conserva su
    // historial de reservas/notificaciones) en vez de crear un usuario nuevo —
    // el email/username son unicos en la base, un create() aqui chocaria.
    const existingInactiveUser = await deps.users.findByEmail(request.email);
    const user =
      existingInactiveUser && existingInactiveUser.status === "INACTIVE"
        ? await deps.users.reactivate(existingInactiveUser.id, {
            name: request.name,
            passwordHash: request.passwordHash,
          })
        : await deps.users.create({
            name: request.name,
            username: usernameFromEmail(request.email),
            email: request.email,
            passwordHash: request.passwordHash,
            status: "PENDING_VERIFICATION",
          });

    await deps.accessRequests.markApproved(requestId, user.id);

    const rawToken = generateRawToken();
    await deps.emailVerificationTokens.create({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: tokenExpiryFromNow(24),
    });

    await deps.notifier.sendAdminDecision({ to: user.email, name: user.name, approved: true });
    await deps.notifier.sendEmailVerification({ to: user.email, name: user.name, rawToken });

    return { id: user.id, status: user.status };
  };
}
