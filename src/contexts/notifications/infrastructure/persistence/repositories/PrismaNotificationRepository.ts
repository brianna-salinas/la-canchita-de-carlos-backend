import { prisma } from "../../../../../db.js";
import type { NotificationRepository, NewNotificationData } from "../../../domain/model/ports/NotificationRepository.js";
import type { Notification } from "../../../domain/model/aggregates/Notification.js";

export class PrismaNotificationRepository implements NotificationRepository {
  async createForUsers(userIds: number[], data: NewNotificationData): Promise<void> {
    if (userIds.length === 0) return;
    await prisma.notification.createMany({
      data: userIds.map((userId) => ({ userId, ...data })),
    });
  }

  async listForUser(userId: number): Promise<Notification[]> {
    const rows = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    return rows.map((row) => ({ ...row, userId: row.userId as number }));
  }

  async markRead(notificationId: number): Promise<void> {
    await prisma.notification.update({ where: { id: notificationId }, data: { read: true } });
  }
}

export const notificationRepository: NotificationRepository = new PrismaNotificationRepository();
