// Entidad de dominio pura del aggregate Payment (bounded context Payments, soporte).
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID";

export interface PayableBooking {
  id: number;
  totalAmount: number;
  paidAmount: number;
}

// Invariante del dominio: el monto pagado nunca puede exceder el total del alquiler.
export function assertAmountWithinTotal(booking: PayableBooking, amountToAdd: number): void {
  if (booking.paidAmount + amountToAdd > booking.totalAmount) {
    throw new Error("El monto pagado no puede exceder el total del alquiler.");
  }
}

export function resolveStatus(booking: PayableBooking, newPaidAmount: number): PaymentStatus {
  return newPaidAmount >= booking.totalAmount ? "PAID" : "PARTIAL";
}
