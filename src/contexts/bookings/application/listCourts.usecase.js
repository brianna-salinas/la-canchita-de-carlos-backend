// Listado completo de canchas para la pantalla de administracion (Canchas):
// a diferencia de getConsolidatedAvailability.usecase.ts (que solo trae las
// habilitadas, para Calendario/Nueva Reserva), este incluye tambien las
// desactivadas, para poder verlas y reactivarlas.
export function makeListCourts(deps) {
    return function listCourts() {
        return deps.courts.listAll();
    };
}
//# sourceMappingURL=listCourts.usecase.js.map