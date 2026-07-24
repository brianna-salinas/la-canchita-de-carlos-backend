import type { ScheduleBlockRepository } from "../domain/model/ports/ScheduleBlockRepository.js";

export function makeListScheduleBlocks(deps: { scheduleBlocks: ScheduleBlockRepository }) {
  return function listScheduleBlocks(courtId: number, dateStr: string) {
    return deps.scheduleBlocks.listForCourtAndDate(courtId, new Date(dateStr));
  };
}
