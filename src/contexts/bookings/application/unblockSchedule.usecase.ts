import type { ScheduleBlockRepository } from "../domain/model/ports/ScheduleBlockRepository.js";

export function makeUnblockSchedule(deps: { scheduleBlocks: ScheduleBlockRepository }) {
  return function unblockSchedule(blockId: number) {
    return deps.scheduleBlocks.deleteById(blockId);
  };
}
