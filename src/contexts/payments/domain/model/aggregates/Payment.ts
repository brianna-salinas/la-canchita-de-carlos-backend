
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID";

export type PaymentMethod = "EFECTIVO" | "YAPE" | "OTRO";

export interface Payment {
  id: number;
  bookingId: number;
  amount: number;
  method: PaymentMethod;
  createdAt: Date;
}

export interface PayableBooking {
  id: number;
  totalAmount: number;
  paidAmount: number;
}

export function assertAmountWithinTotal(booking: PayableBooking, amountToAdd: number): void {
  if (booking.paidAmount + amountToAdd > booking.totalAmount) {
    throw new Error("El monto pagado no puede exceder el total del alquiler.");
  }
}

export function resolveStatus(booking: PayableBooking, newPaidAmount: number): "PAID" | "PARTIAL" {
  return newPaidAmount >= booking.totalAmount ? "PAID" : "PARTIAL";
}
