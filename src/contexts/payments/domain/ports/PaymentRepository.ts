import type { PayableBooking, Payment, PaymentMethod } from "../model/Payment.js";

// Puerto del bounded context Payments. Opera sobre el Booking asociado porque el saldo
// (paidAmount/paymentStatus) vive en el aggregate Booking (RF14/RF15/TS03), y ahora
// tambien persiste cada Payment individual con su metodo (RF16/US16).
export interface PaymentRepository {
  findBookingOrThrow(bookingId: number): Promise<PayableBooking>;

  // Crea el registro de Payment (con su metodo) y actualiza el saldo del Booking
  // en una unica transaccion (atomico: nunca queda un Payment sin reflejarse en el saldo).
  registerPaymentAtomic(
    bookingId: number,
    amount: number,
    method: PaymentMethod,
    newPaidAmount: number,
    status: "PARTIAL" | "PAID"
  ): Promise<{ booking: PayableBooking; payment: Payment }>;

  listPaymentsForBooking(bookingId: number): Promise<Payment[]>;
  // receiptPath: desde el bucket privado, guardamos la ruta interna (no una URL publica).
  attachReceipt(bookingId: number, receiptPath: string): Promise<PayableBooking>;
  // Recupera la ruta guardada para poder generar una signed URL bajo demanda (TS08).
  getReceiptPath(bookingId: number): Promise<string | null>;
}
