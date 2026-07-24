import type { UserRepository } from "../domain/model/ports/UserRepository.js";
import { hashPassword } from "../../../platform/security/password.js";
import { assertNonEmpty, assertMinLength, normalizeEmail, assertValidEmail, normalizeText } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface BootstrapOwnerInput {
  name: string;
  username: string;
  email: string;
  password: string;
  setupToken: string;
}

export function makeBootstrapOwner(deps: { users: UserRepository }) {
  return async function bootstrapOwner(input: BootstrapOwnerInput) {
    const expectedToken = process.env.SETUP_TOKEN;
    if (!expectedToken) {
      throw new HttpError(500, "SETUP_TOKEN no esta configurado en el servidor.");
    }
    if (input.setupToken !== expectedToken) {
      throw new HttpError(403, "Token de configuracion invalido.");
    }

    const existingOwners = await deps.users.countOwners();
    if (existingOwners > 0) {
      throw new HttpError(409, "Ya existe un administrador dueno. Este endpoint ya no esta disponible.");
    }

    let email: string;
    try {
      assertNonEmpty(input.name, "El nombre");
      assertNonEmpty(input.username, "El nombre de usuario");
      email = normalizeEmail(input.email);
      assertValidEmail(email);
      assertMinLength(input.password, 8, "La contraseña");
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    const existing = await deps.users.findByEmail(email);
    if (existing) {
      throw new HttpError(409, "Ya existe una cuenta con ese correo.");
    }

    const passwordHash = await hashPassword(input.password);
    const owner = await deps.users.create({
      name: normalizeText(input.name),
      username: input.username.trim(),
      email,
      passwordHash,
      status: "ACTIVE",
      isOwner: true,
    });

    return { id: owner.id, username: owner.username, email: owner.email, isOwner: owner.isOwner };
  };
}
