import type { UserRepository } from "../domain/ports/UserRepository.js";
import type { AccessRequestRepository } from "../domain/ports/AccessRequestRepository.js";
import type { NotificationSender } from "../../notifications/application/ports/NotificationSender.js";
import { hashPassword } from "../../../platform/security/password.js";
import {
  assertNonEmpty,
  assertMaxLength,
  assertMinLength,
  normalizeText,
  normalizeEmail,
  assertValidEmail,
  normalizePhone,
  assertValidPhone,
} from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface RequestAdminRegistrationInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
}

// TS05 / US20 — registrar una solicitud de cuenta de administrador (RF20).
export function makeRequestAdminRegistration(deps: {
  users: UserRepository;
  accessRequests: AccessRequestRepository;
  notifier: NotificationSender;
}) {
  return async function requestAdminRegistration(input: RequestAdminRegistrationInput) {
    let email: string;
    let phone: string | undefined;
    try {
      assertNonEmpty(input.name, "El nombre");
      assertMaxLength(input.name, 150, "El nombre");
      email = normalizeEmail(input.email);
      assertValidEmail(email);
      assertMinLength(input.password, 8, "La contraseña");
      if (input.phone) {
        assertValidPhone(input.phone);
        phone = normalizePhone(input.phone);
      }
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    // Si el correo pertenece a una cuenta desactivada (soft-delete), se deja pasar:
    // al autorizar la solicitud se reactiva esa misma fila en vez de bloquear el
    // registro para siempre por un email/username que ya nadie puede usar.
    const existingUser = await deps.users.findByEmail(email);
    if (existingUser && existingUser.status !== "INACTIVE") {
      throw new HttpError(409, "Ya existe una cuenta con ese correo.");
    }
    const existingRequest = await deps.accessRequests.findByEmailPending(email);
    if (existingRequest) {
      throw new HttpError(409, "Ya existe una solicitud pendiente con ese correo.");
    }

    const passwordHash = await hashPassword(input.password);
    const request = await deps.accessRequests.create({
      name: normalizeText(input.name),
      email,
      phone,
      passwordHash,
    });

    // RF21/RF24 — avisa a los owners activos, fuera de la ruta critica: un fallo de
    // envio nunca debe impedir que la solicitud quede registrada.
    const ownerEmails = await deps.users.listOwnerEmails();
    for (const to of ownerEmails) {
      void deps.notifier.sendNewAccessRequestAlert({ to, requesterName: normalizeText(input.name), requesterEmail: email });
    }

    return { id: request.id, status: request.status };
  };
}
