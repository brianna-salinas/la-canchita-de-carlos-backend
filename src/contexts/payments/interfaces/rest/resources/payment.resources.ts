import type { Payment, PaymentMethod } from "../../../domain/model/aggregates/Payment.js";

export type PaymentResource = Payment;

export interface RegisterPaymentRequest {
  bookingId: number;
  amount: number;
  method: PaymentMethod;
}

export interface ReceiptSignedUrlResource {
  url: string;
}
