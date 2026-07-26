import type { BookingRepository } from "../domain/model/ports/BookingRepository.js";
import type { PaymentRepository } from "../../payments/domain/model/ports/PaymentRepository.js";

export function makeCancelBooking(deps: { bookings: BookingRepository; payments: PaymentRepository }) {
  return async function cancelBooking(bookingId: number) {
    // Al cancelar una reserva se reversan primero sus pagos (si tenia
    // alguno registrado): se marcan como reversados (soft, conservan el
    // rastro de auditoria) y se reinicia el saldo pagado a 0. Recien
    // despues se marca la reserva como CANCELLED. Si la reversion falla,
    // la reserva se queda como estaba (BOOKED) en vez de cancelarse con
    // pagos huerfanos.
    await deps.payments.reverseAllForBooking(bookingId);
    return deps.bookings.cancel(bookingId);
  };
}
