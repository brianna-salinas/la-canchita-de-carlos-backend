import type { UserRepository } from "../domain/ports/UserRepository.js";
import type { AccessRequestRepository } from "../domain/ports/AccessRequestRepository.js";
import type { NotificationSender } from "../../notifications/application/ports/NotificationSender.js";
import { hashPassword } from "../../../platform/security/password.js";
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
    const existingUser = await deps.users.findByEmail(input.email);
    if (existingUser) {
      throw new HttpError(409, "Ya existe una cuenta con ese correo.");
    }
    const existingRequest = await deps.accessRequests.findByEmailPending(input.email);
    if (existingRequest) {
      throw new HttpError(409, "Ya existe una solicitud pendiente con ese correo.");
    }

    const passwordHash = await hashPassword(input.password);
    const request = await deps.accessRequests.create({
      name: input.name,
      email: input.email,
      phone: input.phone,
      passwordHash,
    });

    // RF21/RF24 — avisa a los owners activos, fuera de la ruta critica: un fallo de
    // envio nunca debe impedir que la solicitud quede registrada.
    const ownerEmails = await deps.users.listOwnerEmails();
    for (const to of ownerEmails) {
      void deps.notifier.sendNewAccessRequestAlert({ to, requesterName: input.name, requesterEmail: input.email });
    }

    return { id: request.id, status: request.status };
  };
}
