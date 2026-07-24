import type { CourtRepository } from "../domain/model/ports/CourtRepository.js";

// Listado completo de canchas para la pantalla de administracion (Canchas):
// a diferencia de getConsolidatedAvailability.usecase.ts (que solo trae las
// habilitadas, para Calendario/Nueva Reserva), este incluye tambien las
// desactivadas, para poder verlas y reactivarlas.
export function makeListCourts(deps: { courts: CourtRepository }) {
  return function listCourts() {
    return deps.courts.listAll();
  };
}
