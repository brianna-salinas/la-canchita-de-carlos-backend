import { assertValidPrice, assertValidOperatingHours } from "../domain/model/Court.js";
import { assertNonEmpty, assertMaxLength, normalizeText } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";
// US11 — registrar una cancha nueva (nombre unico dentro del negocio). El
// horario de atencion es opcional: si el usuario no lo configura, la cancha
// queda disponible las 24 horas (sin restriccion de franja horaria).
export function makeRegisterCourt(deps) {
    return async function registerCourt(input) {
        const openTime = input.openTime || null;
        const closeTime = input.closeTime || null;
        try {
            assertNonEmpty(input.name, "El nombre de la cancha");
            assertMaxLength(input.name, 100, "El nombre de la cancha");
            assertNonEmpty(input.sport, "El deporte");
            assertValidPrice(input.pricePerHour);
            if (openTime || closeTime) {
                if (!openTime || !closeTime) {
                    throw new Error("Debes indicar tanto la hora de apertura como la de cierre, o dejar ambas vacías.");
                }
                assertValidOperatingHours(openTime, closeTime);
            }
        }
        catch (e) {
            throw new HttpError(400, e.message);
        }
        const name = normalizeText(input.name);
        const existing = await deps.courts.findByName(name);
        if (existing) {
            throw new HttpError(409, "Ya existe una cancha con ese nombre.");
        }
        return deps.courts.create({
            ...input,
            name,
            sport: normalizeText(input.sport),
            openTime,
            closeTime,
        });
    };
}
//# sourceMappingURL=registerCourt.usecase.js.map