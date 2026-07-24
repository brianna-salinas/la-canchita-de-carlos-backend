import "dotenv/config";
import type { NotificationSender } from "../application/ports/NotificationSender.js";
export declare class ResendNotificationSender implements NotificationSender {
    private send;
    sendBookingConfirmation(params: {
        to: string;
        customerName: string;
        courtName: string;
        date: string;
        startTime: string;
        endTime: string;
    }): Promise<void>;
    sendAdminDecision(params: {
        to: string;
        name: string;
        approved: boolean;
    }): Promise<void>;
    sendEmailVerification(params: {
        to: string;
        name: string;
        rawToken: string;
    }): Promise<void>;
    sendNewAccessRequestAlert(params: {
        to: string;
        requesterName: string;
        requesterEmail: string;
    }): Promise<void>;
    sendNewBookingAlert(params: {
        to: string;
        registeredByName: string;
        courtName: string;
        date: string;
        startTime: string;
        endTime: string;
    }): Promise<void>;
}
export declare const notificationSender: NotificationSender;
//# sourceMappingURL=ResendNotificationSender.d.ts.map