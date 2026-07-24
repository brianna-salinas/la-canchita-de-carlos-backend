import type { CourtRepository } from "../domain/model/ports/CourtRepository.js";
import { assertValidPrice, assertValidOperatingHours } from "../domain/model/aggregates/Court.js";
import { assertNonEmpty, assertMaxLength, normalizeText } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface RegisterCourtInput {
  name: string;
  sport: string;
  surface?: string;
  pricePerHour: number;
  openTime?: string;
  closeTime?: string;
}

export function makeRegisterCourt(deps: { courts: CourtRepository }) {
  return async function registerCourt(input: RegisterCourtInput) {
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
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
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
