import type { BookingRepository } from "../domain/model/ports/BookingRepository.js";

export function makeCancelBooking(deps: { bookings: BookingRepository }) {
  return function cancelBooking(bookingId: number) {
    return deps.bookings.cancel(bookingId);
  };
}
