import { assertValidPrice } from "../domain/model/Court.js";
import { HttpError } from "../../../platform/errors/HttpError.js";
// US12 — actualizar el precio de una cancha (RF12: no puede ser negativo ni cero).
export function makeUpdateCourtPrice(deps) {
    return async function updateCourtPrice(courtId, pricePerHour) {
        try {
            assertValidPrice(pricePerHour);
        }
        catch (e) {
            throw new HttpError(400, e.message);
        }
        return deps.courts.updatePrice(courtId, pricePerHour);
    };
}
//# sourceMappingURL=updateCourtPrice.usecase.js.map