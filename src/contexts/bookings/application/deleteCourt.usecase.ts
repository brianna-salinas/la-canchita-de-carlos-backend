import type { CourtRepository } from "../domain/ports/CourtRepository.js";

// "Eliminar" una cancha es un borrado real e irreversible: se borra la
// fila de la cancha y, en cascada a nivel de base de datos (ver migracion
// court_delete_cascade), sus bloqueos de horario, sus reservas y los pagos
// de esas reservas. Antes esto era un soft-delete (enabled=false); se
// cambio a pedido explicito para que "eliminar" borre de verdad.
export function makeDeleteCourt(deps: { courts: CourtRepository }) {
  return async function deleteCourt(courtId: number) {
    await deps.courts.findByIdOrThrow(courtId);
    await deps.courts.delete(courtId);
  };
}
