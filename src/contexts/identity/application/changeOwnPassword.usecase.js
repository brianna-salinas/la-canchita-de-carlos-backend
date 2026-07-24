import { hashPassword, verifyPassword } from "../../../platform/security/password.js";
import { assertMinLength } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";
// TS07 / RF29 / US25 — cambiar la contrasena propia, validando la actual, e invalidando sesiones activas.
export function makeChangeOwnPassword(deps) {
    return async function changeOwnPassword(userId, currentPassword, newPassword) {
        try {
            assertMinLength(newPassword, 8, "La nueva contrasena");
        }
        catch (e) {
            throw new HttpError(400, e.message);
        }
        const user = await deps.users.findByIdOrThrow(userId);
        const valid = await verifyPassword(currentPassword, user.passwordHash);
        if (!valid) {
            throw new HttpError(401, "La contrasena actual no es correcta.");
        }
        const newHash = await hashPassword(newPassword);
        await deps.users.updatePasswordHash(userId, newHash);
        await deps.sessions.revokeAllForUser(userId);
        return { updated: true };
    };
}
//# sourceMappingURL=changeOwnPassword.usecase.js.map