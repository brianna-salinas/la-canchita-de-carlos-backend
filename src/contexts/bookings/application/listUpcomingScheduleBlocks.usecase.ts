import type { ScheduleBlockRepository } from "../domain/ports/ScheduleBlockRepository.js";

// RF07/RF32 — lista los mantenimientos programados (desde hoy en adelante)
// de una cancha, para poder verlos y cancelarlos desde Canchas (antes solo
// se podian crear, no habia forma de verlos agrupados ni de deshacerlos si
// alguien se equivocaba).
export function makeListUpcomingScheduleBlocks(deps: { scheduleBlocks: ScheduleBlockRepository }) {
  return function listUpcomingScheduleBlocks(courtId: number) {
    const hoy = new Date();
    const inicioDeHoy = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate()));
    return deps.scheduleBlocks.listUpcomingForCourt(courtId, inicioDeHoy);
  };
}
