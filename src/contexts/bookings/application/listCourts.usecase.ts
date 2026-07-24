import type { CourtRepository } from "../domain/model/ports/CourtRepository.js";

export function makeListCourts(deps: { courts: CourtRepository }) {
  return function listCourts() {
    return deps.courts.listAll();
  };
}
