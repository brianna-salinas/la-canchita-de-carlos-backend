import type { CourtRepository } from "../domain/ports/CourtRepository.js";
import { assertValidPrice } from "../domain/model/Court.js";
import { assertNonEmpty, assertMaxLength, normalizeText } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface RegisterCourtInput {
  name: string;
  sport: string;
  surface?: string;
  pricePerHour: number;
}

// US11 — registrar una cancha nueva (nombre unico dentro del negocio).
export function makeRegisterCourt(deps: { courts: CourtRepository }) {
  return async function registerCourt(input: RegisterCourtInput) {
    try {
      assertNonEmpty(input.name, "El nombre de la cancha");
      assertMaxLength(input.name, 100, "El nombre de la cancha");
      assertNonEmpty(input.sport, "El deporte");
      assertValidPrice(input.pricePerHour);
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    const name = normalizeText(input.name);
    const existing = await deps.courts.findByName(name);
    if (existing) {
      throw new HttpError(409, "Ya existe una cancha con ese nombre.");
    }

    return deps.courts.create({ ...input, name, sport: normalizeText(input.sport) });
  };
}
