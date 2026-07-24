import type { PaymentRepository } from "../domain/model/ports/PaymentRepository.js";

// US16 — historial de pagos (con metodo) de un alquiler, para mostrar trazabilidad.
export function makeListPaymentsForBooking(deps: { payments: PaymentRepository }) {
  return function listPaymentsForBooking(bookingId: number) {
    return deps.payments.listPaymentsForBooking(bookingId);
  };
}
