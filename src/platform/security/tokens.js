import { randomBytes, createHash } from "crypto";
// Genera un token opaco de un solo uso (verificacion de correo RF34, reset de contrasena).
// Se entrega el token en texto plano por correo, pero solo se guarda su hash en la base de datos.
export function generateRawToken() {
    return randomBytes(32).toString("hex");
}
export function hashToken(rawToken) {
    return createHash("sha256").update(rawToken).digest("hex");
}
export function tokenExpiryFromNow(hours) {
    return new Date(Date.now() + hours * 60 * 60 * 1000);
}
//# sourceMappingURL=tokens.js.map