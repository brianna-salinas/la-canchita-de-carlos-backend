import type { PaymentRepository } from "../domain/model/ports/PaymentRepository.js";

export function makeListPaymentsForBooking(deps: { payments: PaymentRepository }) {
  return function listPaymentsForBooking(bookingId: number) {
    return deps.payments.listPaymentsForBooking(bookingId);
  };
}
