import type { PaymentRepository } from "../../domain/ports/PaymentRepository.js";
import type { PayableBooking, Payment, PaymentMethod } from "../../domain/model/Payment.js";
export declare class PrismaPaymentRepository implements PaymentRepository {
    findBookingOrThrow(bookingId: number): Promise<PayableBooking>;
    registerPaymentAtomic(bookingId: number, amount: number, method: PaymentMethod, newPaidAmount: number, status: "PARTIAL" | "PAID"): Promise<{
        booking: PayableBooking;
        payment: Payment;
    }>;
    listPaymentsForBooking(bookingId: number): Promise<Payment[]>;
    attachReceipt(bookingId: number, receiptPath: string): Promise<PayableBooking>;
    getReceiptPath(bookingId: number): Promise<string | null>;
}
export declare const paymentRepository: PaymentRepository;
//# sourceMappingURL=PrismaPaymentRepository.d.ts.map