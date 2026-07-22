import type { CourtRepository } from "../domain/ports/CourtRepository.js";

// "Eliminar" una cancha en el negocio es en realidad un soft-delete
// (enabled=false): no se borra la fila porque tiene reservas y
// bloqueos de mantenimiento ligados por FK (historial de auditoria).
export function makeDeactivateCourt(deps: { courts: CourtRepository }) {
  return async function deactivateCourt(courtId: number) {
    await deps.courts.findByIdOrThrow(courtId);
    return deps.courts.deactivate(courtId);
  };
}
