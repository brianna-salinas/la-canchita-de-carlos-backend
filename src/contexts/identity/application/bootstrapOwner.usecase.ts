import type { UserRepository } from "../domain/ports/UserRepository.js";
import { hashPassword } from "../../../platform/security/password.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface BootstrapOwnerInput {
  name: string;
  username: string;
  email: string;
  password: string;
  setupToken: string;
}

// Endpoint de arranque: crea al primer administrador dueno directamente (ya ACTIVE,
// sin pasar por AccessRequest ni verificacion de correo), rompiendo el problema de
// huevo-y-gallina de RF21 (solo el dueno puede autorizar, pero al inicio no hay dueno).
//
// Se autodesactiva solo: si ya existe un owner, siempre rechaza (409). Ademas exige
// un SETUP_TOKEN (variable de entorno, no un secreto de negocio) para que no cualquiera
// pueda llamarlo mientras el sistema esta recien desplegado y sin owner todavia.
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

    const existing = await deps.users.findByEmail(input.email);
    if (existing) {
      throw new HttpError(409, "Ya existe una cuenta con ese correo.");
    }

    const passwordHash = await hashPassword(input.password);
    const owner = await deps.users.create({
      name: input.name,
      username: input.username,
      email: input.email,
      passwordHash,
      status: "ACTIVE",
      isOwner: true,
    });

    return { id: owner.id, username: owner.username, email: owner.email, isOwner: owner.isOwner };
  };
}
