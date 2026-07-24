import { hashPassword } from "../../../platform/security/password.js";
import { assertNonEmpty, assertMaxLength, assertMinLength, normalizeText, normalizeEmail, assertValidEmail, normalizePhone, assertValidPhone, } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";
// TS05 / US20 — registrar una solicitud de cuenta de administrador (RF20).
export function makeRequestAdminRegistration(deps) {
    return async function requestAdminRegistration(input) {
        let email;
        let phone;
        try {
            assertNonEmpty(input.name, "El nombre");
            assertMaxLength(input.name, 150, "El nombre");
            email = normalizeEmail(input.email);
            assertValidEmail(email);
            assertMinLength(input.password, 8, "La contrasena");
            if (input.phone) {
                assertValidPhone(input.phone);
                phone = normalizePhone(input.phone);
            }
        }
        catch (e) {
            throw new HttpError(400, e.message);
        }
        const existingUser = await deps.users.findByEmail(email);
        if (existingUser) {
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
//# sourceMappingURL=requestAdminRegistration.usecase.js.map