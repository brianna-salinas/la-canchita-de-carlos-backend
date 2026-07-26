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

  /**
   * Reversa (soft) todos los pagos activos de una reserva y reinicia su
   * saldo. Se invoca al cancelar una reserva (RF ciclo de vida de alquiler)
   * para que un alquiler cancelado no quede con pagos "colgados": los
   * registros de pago no se borran (quedan como rastro de auditoria con
   * reversedAt seteado), pero dejan de contar como saldo pagado.
   */
  reverseAllForBooking(bookingId: number): Promise<{ booking: PayableBooking; reversedCount: number }>;
}
