// "Eliminar" una cancha es un borrado real e irreversible: se borra la
// fila de la cancha y, en cascada a nivel de base de datos (ver migracion
// court_delete_cascade), sus bloqueos de horario, sus reservas y los pagos
// de esas reservas. Antes esto era un soft-delete (enabled=false); se
// cambio a pedido explicito para que "eliminar" borre de verdad.
export function makeDeleteCourt(deps) {
    return async function deleteCourt(courtId) {
        await deps.courts.findByIdOrThrow(courtId);
        await deps.courts.delete(courtId);
    };
}
//# sourceMappingURL=deleteCourt.usecase.js.map