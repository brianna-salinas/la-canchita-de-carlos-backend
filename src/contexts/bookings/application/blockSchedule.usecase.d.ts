import type { ScheduleBlockRepository } from "../domain/ports/ScheduleBlockRepository.js";
import type { BookingRepository } from "../domain/ports/BookingRepository.js";
export interface BlockScheduleInput {
    courtId: number;
    date: string;
    startTime: string;
    endTime: string;
    reason?: string;
}
export declare function makeBlockSchedule(deps: {
    scheduleBlocks: ScheduleBlockRepository;
    bookings: BookingRepository;
}): (input: BlockScheduleInput) => Promise<import("../domain/model/ScheduleBlock.js").ScheduleBlock[]>;
//# sourceMappingURL=blockSchedule.usecase.d.ts.map