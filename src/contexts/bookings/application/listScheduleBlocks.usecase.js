// RF32/US31 — listar los bloqueos por mantenimiento de una cancha en una fecha, con motivo.
export function makeListScheduleBlocks(deps) {
    return function listScheduleBlocks(courtId, dateStr) {
        return deps.scheduleBlocks.listForCourtAndDate(courtId, new Date(dateStr));
    };
}
//# sourceMappingURL=listScheduleBlocks.usecase.js.map