import type { Notification, NotificationType } from "../aggregates/Notification.js";

export interface NewNotificationData {
  type: NotificationType;
  title: string;
  message?: string;
  linkUrl?: string;
}

export interface NotificationRepository {
  createForUsers(userIds: number[], data: NewNotificationData): Promise<void>;
  listForUser(userId: number): Promise<Notification[]>;
  markRead(notificationId: number): Promise<void>;
}
