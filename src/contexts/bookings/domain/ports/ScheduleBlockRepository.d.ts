import type { ScheduleBlock } from "../model/ScheduleBlock.js";
export interface ScheduleBlockRepository {
    createMany(courtId: number, date: Date, times: Date[], reason?: string): Promise<ScheduleBlock[]>;
    listForCourtAndDate(courtId: number, date: Date): Promise<ScheduleBlock[]>;
    listUpcomingForCourt(courtId: number, fromDate: Date): Promise<ScheduleBlock[]>;
    deleteById(blockId: number): Promise<void>;
}
//# sourceMappingURL=ScheduleBlockRepository.d.ts.map