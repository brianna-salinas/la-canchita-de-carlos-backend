import type { ScheduleBlockRepository } from "../domain/ports/ScheduleBlockRepository.js";
export declare function makeListScheduleBlocks(deps: {
    scheduleBlocks: ScheduleBlockRepository;
}): (courtId: number, dateStr: string) => Promise<import("../domain/model/ScheduleBlock.js").ScheduleBlock[]>;
//# sourceMappingURL=listScheduleBlocks.usecase.d.ts.map