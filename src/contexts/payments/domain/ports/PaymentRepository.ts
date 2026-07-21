import type { PayableBooking } from "../model/Payment.js";

// Puerto del bounded context Payments. Opera sobre el Booking asociado porque el saldo
// (paidAmount/paymentStatus) vive en el aggregate Booking (RF14/RF15/TS03).
export interface PaymentRepository {
  findBookingOrThrow(bookingId: number): Promise<PayableBooking>;
  applyPayment(bookingId: number, newPaidAmount: number, status: "PARTIAL" | "PAID"): Promise<PayableBooking>;
  attachReceipt(bookingId: number, receiptUrl: string): Promise<PayableBooking>;
}
