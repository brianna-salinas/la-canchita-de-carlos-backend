import type { ScheduleBlockRepository } from "../domain/ports/ScheduleBlockRepository.js";
export declare function makeListUpcomingScheduleBlocks(deps: {
    scheduleBlocks: ScheduleBlockRepository;
}): (courtId: number) => Promise<import("../domain/model/ScheduleBlock.js").ScheduleBlock[]>;
//# sourceMappingURL=listUpcomingScheduleBlocks.usecase.d.ts.map