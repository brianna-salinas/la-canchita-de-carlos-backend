import type { BookingRepository } from "../domain/ports/BookingRepository.js";
import type { CourtRepository } from "../domain/ports/CourtRepository.js";
import type { AdminDirectory } from "../domain/ports/AdminDirectory.js";
import type { NotificationSender } from "../../notifications/application/ports/NotificationSender.js";
import type { NotificationRepository } from "../../notifications/domain/ports/NotificationRepository.js";
export interface RegisterBookingSeriesInput {
    courtId: number;
    customerId?: number;
    clienteNuevo?: {
        name: string;
        phone: string;
        documentNumber?: string;
    };
    customerName: string;
    customerEmail?: string;
    type?: string;
    dates: string[];
    startTime: string;
    endTime: string;
    totalAmount: number;
    seriesPaymentMode: "INDIVIDUAL" | "LUMP_SUM";
    seriesLabel?: string;
    bookingType?: "MULTIDAY" | "RECURRING";
    actorUserId?: number;
}
export declare function makeRegisterBookingSeries(deps: {
    bookings: BookingRepository;
    courts: CourtRepository;
    notifier: NotificationSender;
    admins: AdminDirectory;
    notifications: NotificationRepository;
}): (input: RegisterBookingSeriesInput) => Promise<import("../domain/model/Booking.js").Booking[]>;
//# sourceMappingURL=registerBookingSeries.usecase.d.ts.map