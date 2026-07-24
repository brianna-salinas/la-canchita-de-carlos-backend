import type { Notification, NotificationType } from "../aggregates/Notification.js";

export interface NewNotificationData {
  type: NotificationType;
  title: string;
  message?: string;
  linkUrl?: string;
}

// Puerto para las notificaciones IN-APP (persistidas, distinto del correo -> NotificationSender).
export interface NotificationRepository {
  createForUsers(userIds: number[], data: NewNotificationData): Promise<void>;
  listForUser(userId: number): Promise<Notification[]>;
  markRead(notificationId: number): Promise<void>;
}
