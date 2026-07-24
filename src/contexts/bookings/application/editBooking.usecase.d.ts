import type { BookingRepository } from "../domain/ports/BookingRepository.js";
import type { CourtRepository } from "../domain/ports/CourtRepository.js";
export interface EditBookingInput {
    courtId?: number;
    customerName?: string;
    type?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    totalAmount?: number;
    paidAmount?: number;
}
export declare function makeEditBooking(deps: {
    bookings: BookingRepository;
    courts: CourtRepository;
}): (bookingId: number, input: EditBookingInput) => Promise<import("../domain/model/Booking.js").Booking>;
//# sourceMappingURL=editBooking.usecase.d.ts.map