import type { CourtRepository } from "../domain/model/ports/CourtRepository.js";

export function makeGetConsolidatedAvailability(deps: { courts: CourtRepository }) {
  return function getConsolidatedAvailability(date: string) {
    return deps.courts.getConsolidatedAvailability(new Date(date));
  };
}
