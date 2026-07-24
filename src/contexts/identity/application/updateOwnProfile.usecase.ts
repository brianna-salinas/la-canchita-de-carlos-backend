import type { UserRepository } from "../domain/model/ports/UserRepository.js";
import { assertNonEmpty, assertMaxLength, normalizeText } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface UpdateOwnProfileInput {
  name?: string;
  username?: string;
}

export function makeUpdateOwnProfile(deps: { users: UserRepository }) {
  return async function updateOwnProfile(userId: number, input: UpdateOwnProfileInput) {
    const data: { name?: string; username?: string } = {};

    try {
      if (input.name !== undefined) {
        assertNonEmpty(input.name, "El nombre");
        assertMaxLength(input.name, 100, "El nombre");
        data.name = normalizeText(input.name);
      }
      if (input.username !== undefined) {
        assertNonEmpty(input.username, "El usuario");
        assertMaxLength(input.username, 50, "El usuario");
        data.username = normalizeText(input.username).toLowerCase();
      }
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    if (data.username !== undefined) {
      const existing = await deps.users.findByUsernameOrEmail(data.username);
      if (existing && existing.id !== userId) {
        throw new HttpError(409, "Ese usuario ya esta en uso por otra cuenta.");
      }
    }

    const updated = await deps.users.updateProfile(userId, data);
    return { id: updated.id, name: updated.name, username: updated.username };
  };
}
