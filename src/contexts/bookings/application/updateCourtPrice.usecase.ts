import type { CourtRepository } from "../domain/model/ports/CourtRepository.js";
import { assertValidPrice } from "../domain/model/aggregates/Court.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export function makeUpdateCourtPrice(deps: { courts: CourtRepository }) {
  return async function updateCourtPrice(courtId: number, pricePerHour: number) {
    try {
      assertValidPrice(pricePerHour);
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }
    return deps.courts.updatePrice(courtId, pricePerHour);
  };
}
