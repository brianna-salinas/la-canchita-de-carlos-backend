import type { ScheduleBlockRepository } from "../../domain/ports/ScheduleBlockRepository.js";
import type { ScheduleBlock } from "../../domain/model/ScheduleBlock.js";
export declare class PrismaScheduleBlockRepository implements ScheduleBlockRepository {
    createMany(courtId: number, date: Date, times: Date[], reason?: string): Promise<ScheduleBlock[]>;
    listForCourtAndDate(courtId: number, date: Date): Promise<ScheduleBlock[]>;
    listUpcomingForCourt(courtId: number, fromDate: Date): Promise<ScheduleBlock[]>;
    deleteById(blockId: number): Promise<void>;
}
export declare const scheduleBlockRepository: ScheduleBlockRepository;
//# sourceMappingURL=PrismaScheduleBlockRepository.d.ts.map