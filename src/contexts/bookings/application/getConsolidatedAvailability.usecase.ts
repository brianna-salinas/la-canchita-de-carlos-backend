import type { CourtRepository } from "../domain/ports/CourtRepository.js";

// US13 — disponibilidad consolidada de todas las canchas para una fecha.
export function makeGetConsolidatedAvailability(deps: { courts: CourtRepository }) {
  return function getConsolidatedAvailability(date: string) {
    return deps.courts.getConsolidatedAvailability(new Date(date));
  };
}
