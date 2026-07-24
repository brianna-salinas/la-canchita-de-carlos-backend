import { prisma } from "../../../../db.js";
// Adaptador de salida: implementa NotificationRepository (in-app) contra Prisma/PostgreSQL.
export class PrismaNotificationRepository {
    async createForUsers(userIds, data) {
        if (userIds.length === 0)
            return;
        await prisma.notification.createMany({
            data: userIds.map((userId) => ({ userId, ...data })),
        });
    }
    async listForUser(userId) {
        const rows = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
        return rows.map((row) => ({ ...row, userId: row.userId }));
    }
    async markRead(notificationId) {
        await prisma.notification.update({ where: { id: notificationId }, data: { read: true } });
    }
}
export const notificationRepository = new PrismaNotificationRepository();
//# sourceMappingURL=PrismaNotificationRepository.js.map