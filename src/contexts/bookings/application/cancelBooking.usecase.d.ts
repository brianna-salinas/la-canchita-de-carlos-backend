import type { BookingRepository } from "../domain/ports/BookingRepository.js";
export declare function makeCancelBooking(deps: {
    bookings: BookingRepository;
}): (bookingId: number) => Promise<import("../domain/model/Booking.js").Booking>;
//# sourceMappingURL=cancelBooking.usecase.d.ts.map