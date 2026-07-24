// US13 — disponibilidad consolidada de todas las canchas para una fecha.
export function makeGetConsolidatedAvailability(deps) {
    return function getConsolidatedAvailability(date) {
        return deps.courts.getConsolidatedAvailability(new Date(date));
    };
}
//# sourceMappingURL=getConsolidatedAvailability.usecase.js.map