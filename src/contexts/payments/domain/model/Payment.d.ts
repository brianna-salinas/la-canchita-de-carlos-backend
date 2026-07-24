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
export declare function assertAmountWithinTotal(booking: PayableBooking, amountToAdd: number): void;
export declare function resolveStatus(booking: PayableBooking, newPaidAmount: number): "PAID" | "PARTIAL";
//# sourceMappingURL=Payment.d.ts.map