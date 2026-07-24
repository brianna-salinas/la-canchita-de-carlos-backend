import type { PaymentRepository } from "../domain/ports/PaymentRepository.js";
export declare function makeListPaymentsForBooking(deps: {
    payments: PaymentRepository;
}): (bookingId: number) => Promise<import("../domain/model/Payment.js").Payment[]>;
//# sourceMappingURL=listPaymentsForBooking.usecase.d.ts.map