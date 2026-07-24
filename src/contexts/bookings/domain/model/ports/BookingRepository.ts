import type { Booking, BookingStatus, PaymentStatus, TimeRange } from "../aggregates/Booking.js";

export interface NewBookingData {
  courtId: number;
  customerId?: number;
  customerName: string;
  type?: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  totalAmount: number;

  paidAmount?: number;
  paymentStatus?: PaymentStatus;

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
