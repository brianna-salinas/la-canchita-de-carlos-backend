import type { UserRepository } from "../domain/ports/UserRepository.js";
import { normalizeEmail, assertValidEmail } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

// TS07 / RF28 / US24 — actualizar el correo propio.
export function makeUpdateOwnEmail(deps: { users: UserRepository }) {
  return async function updateOwnEmail(userId: number, newEmail: string) {
    const email = normalizeEmail(newEmail);
    try {
      assertValidEmail(email);
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }
    const existing = await deps.users.findByEmail(email);
    if (existing && existing.id !== userId) {
      throw new HttpError(409, "Ese correo ya esta en uso por otra cuenta.");
    }
    const updated = await deps.users.updateEmail(userId, email);
    return { id: updated.id, email: updated.email };
  };
}
