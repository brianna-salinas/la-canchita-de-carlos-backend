import type { ScheduleBlockRepository } from "../domain/model/ports/ScheduleBlockRepository.js";

export function makeListUpcomingScheduleBlocks(deps: { scheduleBlocks: ScheduleBlockRepository }) {
  return function listUpcomingScheduleBlocks(courtId: number) {
    const hoy = new Date();
    const inicioDeHoy = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
    return deps.scheduleBlocks.listUpcomingForCourt(courtId, inicioDeHoy);
  };
}
