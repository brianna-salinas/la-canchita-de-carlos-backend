import type { BookingRepository } from "../domain/ports/BookingRepository.js";
import type { CourtRepository } from "../domain/ports/CourtRepository.js";
import type { AdminDirectory } from "../domain/ports/AdminDirectory.js";
import type { NotificationSender } from "../../notifications/application/ports/NotificationSender.js";
import type { NotificationRepository } from "../../notifications/domain/ports/NotificationRepository.js";
export interface RegisterBookingInput {
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
    date: string;
    startTime: string;
    endTime: string;
    totalAmount: number;
    actorUserId?: number;
}
export declare function makeRegisterBooking(deps: {
    bookings: BookingRepository;
    courts: CourtRepository;
    notifier: NotificationSender;
    admins: AdminDirectory;
    notifications: NotificationRepository;
}): (input: RegisterBookingInput) => Promise<import("../domain/model/Booking.js").Booking>;
//# sourceMappingURL=registerBooking.usecase.d.ts.map