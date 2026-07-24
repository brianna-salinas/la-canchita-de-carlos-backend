import type { PaymentRepository } from "../domain/ports/PaymentRepository.js";
import type { PaymentMethod } from "../domain/model/Payment.js";
export interface RegisterPaymentInput {
    bookingId: number;
    amount: number;
    method: PaymentMethod;
}
export declare function makeRegisterPayment(deps: {
    payments: PaymentRepository;
}): (input: RegisterPaymentInput) => Promise<{
    booking: import("../domain/model/Payment.js").PayableBooking;
    payment: import("../domain/model/Payment.js").Payment;
}>;
//# sourceMappingURL=registerPayment.usecase.d.ts.map