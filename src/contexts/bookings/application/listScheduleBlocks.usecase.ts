import type { ScheduleBlockRepository } from "../domain/ports/ScheduleBlockRepository.js";

// RF32/US31 — listar los bloqueos por mantenimiento de una cancha en una fecha, con motivo.
export function makeListScheduleBlocks(deps: { scheduleBlocks: ScheduleBlockRepository }) {
  return function listScheduleBlocks(courtId: number, dateStr: string) {
    return deps.scheduleBlocks.listForCourtAndDate(courtId, new Date(dateStr));
  };
}
