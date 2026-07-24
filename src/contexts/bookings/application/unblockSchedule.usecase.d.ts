import type { ScheduleBlockRepository } from "../domain/ports/ScheduleBlockRepository.js";
export declare function makeUnblockSchedule(deps: {
    scheduleBlocks: ScheduleBlockRepository;
}): (blockId: number) => Promise<void>;
//# sourceMappingURL=unblockSchedule.usecase.d.ts.map