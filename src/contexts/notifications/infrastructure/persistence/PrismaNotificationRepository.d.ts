import type { NotificationRepository, NewNotificationData } from "../../domain/ports/NotificationRepository.js";
import type { Notification } from "../../domain/model/Notification.js";
export declare class PrismaNotificationRepository implements NotificationRepository {
    createForUsers(userIds: number[], data: NewNotificationData): Promise<void>;
    listForUser(userId: number): Promise<Notification[]>;
    markRead(notificationId: number): Promise<void>;
}
export declare const notificationRepository: NotificationRepository;
//# sourceMappingURL=PrismaNotificationRepository.d.ts.map