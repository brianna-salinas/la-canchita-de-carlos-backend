import type { Booking, BookingStatus, PaymentStatus, TimeRange } from "../model/Booking.js";

export interface NewBookingData {
  courtId: number;
  customerId?: number;
  customerName: string;
  type?: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  totalAmount: number;
  // Correccion directa de pago desde editBooking.usecase.ts (distinta del
  // flujo normal de "agregar un pago" en Payments, que solo suma). Permite
  // al administrador corregir un monto/estado mal registrado, incluso
  // bajandolo (ej. de PAID a PARTIAL).
  paidAmount?: number;
  paymentStatus?: PaymentStatus;
  // Reservas multidia/recurrentes (US28/frontend): opcionales, solo se completan cuando
  // el Booking pertenece a una serie generada por registerBookingSeries.usecase.ts.
  bookingType?: "SINGLE" | "MULTIDAY" | "RECURRING";
  seriesId?: string;
  seriesPaymentMode?: "INDIVIDUAL" | "LUMP_SUM";
  seriesLabel?: string;
  seriesTotalDates?: number;
  seriesIndex?: number;
}

export interface SearchFilters {
  courtId?: number;
  customerId?: number;
  status?: BookingStatus;
  from?: Date;
  to?: Date;
}

// US08 — el listado de historial necesita datos basicos de la cancha/cliente para la UI.
export type BookingWithRelations = Booking & {
  court?: { id: number; name: string } | null;
  customer?: { id: number; name: string; phone: string } | null;
};


export interface BookingRepository {
  runTransaction<T>(fn: (tx: BookingRepository) => Promise<T>): Promise<T>;

  findActiveOverlapCandidates(courtId: number, date: Date): Promise<(TimeRange & { id: number })[]>;
  isTimeBlocked(courtId: number, date: Date, range: TimeRange): Promise<boolean>;

  createEmbeddedCustomer(data: { name: string; phone: string; documentNumber?: string }): Promise<{ id: number }>;

  create(data: NewBookingData): Promise<Booking>;
  update(bookingId: number, data: Partial<NewBookingData>): Promise<Booking>;
  cancel(bookingId: number): Promise<Booking>;
  findByIdOrThrow(bookingId: number): Promise<Booking>;
  search(filters: SearchFilters): Promise<BookingWithRelations[]>;
}
