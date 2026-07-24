export type NotificationType = "ACCESS_REQUEST" | "PAYMENT_PENDING" | "NEW_BOOKING" | "BOOKING_CANCELLED" | "COURT_MAINTENANCE" | "GENERAL";
export interface Notification {
    id: number;
    userId: number;
    type: NotificationType;
    title: string;
    message?: string | null;
    linkUrl?: string | null;
    read: boolean;
    createdAt: Date;
}
//# sourceMappingURL=Notification.d.ts.map