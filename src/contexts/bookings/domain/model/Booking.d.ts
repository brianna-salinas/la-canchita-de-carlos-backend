export type BookingStatus = "BOOKED" | "CANCELLED" | "COMPLETED";
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID";
export type BookingSeriesType = "SINGLE" | "MULTIDAY" | "RECURRING";
export type SeriesPaymentMode = "INDIVIDUAL" | "LUMP_SUM";
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
    bookingType?: BookingSeriesType;
    seriesId?: string | null;
    seriesPaymentMode?: SeriesPaymentMode | null;
    seriesLabel?: string | null;
    seriesTotalDates?: number | null;
    seriesIndex?: number | null;
}
export interface TimeRange {
    startTime: Date;
    endTime: Date;
}
export declare function overlaps(candidate: TimeRange, existing: TimeRange): boolean;
export declare function hasConflict(candidate: TimeRange, activeBookings: (TimeRange & {
    id: number;
})[], excludeBookingId?: number): boolean;
export declare function resolvePaymentStatus(totalAmount: number, paidAmount: number): PaymentStatus;
export declare function assertValidRange(range: TimeRange): void;
export declare function assertWithinOperatingHours(openTime: string | null | undefined, closeTime: string | null | undefined, range: TimeRange): void;
export declare function assertNotInPast(date: Date, startTime: Date, now?: Date): void;
//# sourceMappingURL=Booking.d.ts.map