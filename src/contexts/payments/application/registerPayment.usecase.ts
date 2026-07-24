import type { PaymentRepository } from "../domain/model/ports/PaymentRepository.js";
import type { PaymentMethod } from "../domain/model/aggregates/Payment.js";
import { assertAmountWithinTotal, resolveStatus } from "../domain/model/aggregates/Payment.js";
import { assertPositiveAmount } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface RegisterPaymentInput {
  bookingId: number;
  amount: number;
  method: PaymentMethod;
}

export function makeRegisterPayment(deps: { payments: PaymentRepository }) {
  return async function registerPayment(input: RegisterPaymentInput) {
    try {
      assertPositiveAmount(input.amount, "El monto del pago");
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    const booking = await deps.payments.findBookingOrThrow(input.bookingId);

    try {
      assertAmountWithinTotal(booking, input.amount);
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    const newPaidAmount = booking.paidAmount + input.amount;
    const status = resolveStatus(booking, newPaidAmount);

    return deps.payments.registerPaymentAtomic(input.bookingId, input.amount, input.method, newPaidAmount, status);
  };
}
