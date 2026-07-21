import type { BookingRepository } from "../domain/ports/BookingRepository.js";

// US05 — cancelar un alquiler, liberando la franja de inmediato.
export function makeCancelBooking(deps: { bookings: BookingRepository }) {
  return function cancelBooking(bookingId: number) {
    return deps.bookings.cancel(bookingId);
  };
}
