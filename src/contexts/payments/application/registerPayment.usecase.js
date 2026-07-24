import { assertAmountWithinTotal, resolveStatus } from "../domain/model/Payment.js";
import { assertPositiveAmount } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";
// TS03 — registra un pago (total o parcial), persistiendo el metodo (RF16/US16) y
// recalculando el saldo del Booking (US14/US15) en una sola transaccion atomica.
export function makeRegisterPayment(deps) {
    return async function registerPayment(input) {
        try {
            assertPositiveAmount(input.amount, "El monto del pago");
        }
        catch (e) {
            throw new HttpError(400, e.message);
        }
        const booking = await deps.payments.findBookingOrThrow(input.bookingId);
        try {
            assertAmountWithinTotal(booking, input.amount);
        }
        catch (e) {
            throw new HttpError(400, e.message);
        }
        const newPaidAmount = booking.paidAmount + input.amount;
        const status = resolveStatus(booking, newPaidAmount);
        return deps.payments.registerPaymentAtomic(input.bookingId, input.amount, input.method, newPaidAmount, status);
    };
}
//# sourceMappingURL=registerPayment.usecase.js.map