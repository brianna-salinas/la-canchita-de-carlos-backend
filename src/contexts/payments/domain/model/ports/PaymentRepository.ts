import type { PayableBooking, Payment, PaymentMethod } from "../aggregates/Payment.js";

// Puerto del bounded context Payments. Opera sobre el Booking asociado porque el saldo
// (paidAmount/paymentStatus) vive en el aggregate Booking (RF14/RF15/TS03), y ahora
// tambien persiste cada Payment individual con su metodo (RF16/US16).
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
  // Recupera la ruta guardada para poder generar una signed URL bajo demanda (TS08).
  getReceiptPath(bookingId: number): Promise<string | null>;
}
