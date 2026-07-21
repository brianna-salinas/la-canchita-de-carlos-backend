// Entidad de dominio pura (anillo "Dominio" de 4.0): sin dependencias de Express,
// Prisma ni ninguna libreria externa. Representa el aggregate Booking del bounded
// context Bookings (nucleo).
export type BookingStatus = "BOOKED" | "CANCELLED" | "COMPLETED";
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID";

export interface Booking {
  id: number;
  courtId: number;
  customerId?: number | null;
  customerName: string;
  type?: string | null;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  receiptUrl?: string | null;
}

export interface TimeRange {
  startTime: Date;
  endTime: Date;
}

// RF06 — invariante central del dominio: no puede existir otro Booking activo que se
// superponga con la misma cancha + franja horaria. Regla pura y testeable sin DB ni servidor.
export function overlaps(candidate: TimeRange, existing: TimeRange): boolean {
  return candidate.startTime < existing.endTime && candidate.endTime > existing.startTime;
}

export function hasConflict(
  candidate: TimeRange,
  activeBookings: (TimeRange & { id: number })[],
  excludeBookingId?: number
): boolean {
  return activeBookings.some((b) => b.id !== excludeBookingId && overlaps(candidate, b));
}

export function assertValidRange(range: TimeRange): void {
  if (range.endTime <= range.startTime) {
    throw new Error("La hora de fin debe ser posterior a la hora de inicio.");
  }
}
