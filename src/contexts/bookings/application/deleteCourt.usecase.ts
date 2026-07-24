import type { CourtRepository } from "../domain/model/ports/CourtRepository.js";

export function makeDeleteCourt(deps: { courts: CourtRepository }) {
  return async function deleteCourt(courtId: number) {
    await deps.courts.findByIdOrThrow(courtId);
    await deps.courts.delete(courtId);
  };
}
