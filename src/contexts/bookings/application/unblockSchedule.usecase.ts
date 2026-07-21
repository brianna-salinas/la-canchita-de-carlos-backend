import type { ScheduleBlockRepository } from "../domain/ports/ScheduleBlockRepository.js";

// RF07 — liberar un bloqueo por mantenimiento antes de tiempo.
export function makeUnblockSchedule(deps: { scheduleBlocks: ScheduleBlockRepository }) {
  return function unblockSchedule(blockId: number) {
    return deps.scheduleBlocks.deleteById(blockId);
  };
}
