import type { PaymentRepository } from "../domain/ports/PaymentRepository.js";
import { assertAmountWithinTotal, resolveStatus } from "../domain/model/Payment.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface RegisterPaymentInput {
  bookingId: number;
  amount: number;
  method: string;
}

// TS03 — registra un pago (total o parcial), recalculando el saldo del Booking (US14/US15).
export function makeRegisterPayment(deps: { payments: PaymentRepository }) {
  return async function registerPayment(input: RegisterPaymentInput) {
    const booking = await deps.payments.findBookingOrThrow(input.bookingId);

    try {
      assertAmountWithinTotal(booking, input.amount);
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    const newPaidAmount = booking.paidAmount + input.amount;
    const status = resolveStatus(booking, newPaidAmount);
    const updated = await deps.payments.applyPayment(input.bookingId, newPaidAmount, status);

    return { booking: updated, method: input.method, amountRegistered: input.amount };
  };
}
