import type { PayableBooking, Payment, PaymentMethod } from "../aggregates/Payment.js";

export interface PaymentRepository {
  findBookingOrThrow(bookingId: number): Promise<PayableBooking>;

  registerPaymentAtomic(
    bookingId: number,
    amount: number,
    method: PaymentMethod,
    newPaidAmount: number,
    status: "PARTIAL" | "PAID"
  ): Promise<{ booking: PayableBooking; payment: Payment }>;

  listPaymentsForBooking(bookingId: number): Promise<Payment[]>;
  attachReceipt(bookingId: number, receiptPath: string): Promise<PayableBooking>;

  getReceiptPath(bookingId: number): Promise<string | null>;
}
