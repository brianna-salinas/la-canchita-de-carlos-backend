import { randomBytes, createHash } from "crypto";

// Genera un token opaco de un solo uso (verificacion de correo RF34, reset de contrasena).
// Se entrega el token en texto plano por correo, pero solo se guarda su hash en la base de datos.
export function generateRawToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function tokenExpiryFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
