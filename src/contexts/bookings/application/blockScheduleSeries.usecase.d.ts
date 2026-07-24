import type { ScheduleBlockRepository } from "../domain/ports/ScheduleBlockRepository.js";
import type { BookingRepository } from "../domain/ports/BookingRepository.js";
import type { CourtRepository } from "../domain/ports/CourtRepository.js";
import type { AdminDirectory } from "../domain/ports/AdminDirectory.js";
import type { NotificationRepository } from "../../notifications/domain/ports/NotificationRepository.js";
export interface BlockScheduleSeriesInput {
    courtId: number;
    dates: string[];
    startTime: string;
    endTime: string;
    reason?: string;
    actorUserId?: number;
}
export declare function makeBlockScheduleSeries(deps: {
    scheduleBlocks: ScheduleBlockRepository;
    bookings: BookingRepository;
    courts: CourtRepository;
    admins: AdminDirectory;
    notifications: NotificationRepository;
}): (input: BlockScheduleSeriesInput) => Promise<import("../domain/model/ScheduleBlock.js").ScheduleBlock[]>;
//# sourceMappingURL=blockScheduleSeries.usecase.d.ts.map