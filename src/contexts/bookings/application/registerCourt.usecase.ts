import type { CourtRepository } from "../domain/ports/CourtRepository.js";
import { assertValidPrice } from "../domain/model/Court.js";
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
    const existing = await deps.courts.findByName(input.name);
    if (existing) {
      throw new HttpError(409, "Ya existe una cancha con ese nombre.");
    }
    try {
      assertValidPrice(input.pricePerHour);
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }
    return deps.courts.create(input);
  };
}
