import { prisma } from "../../../../db.js";
// Adaptador de salida: implementa AdminDirectory contra la tabla users de Prisma.
export class PrismaAdminDirectory {
    async listOtherActiveAdmins(excludeUserId) {
        const admins = await prisma.user.findMany({
            where: { status: "ACTIVE", id: excludeUserId ? { not: excludeUserId } : undefined },
            select: { id: true, email: true },
        });
        return admins;
    }
    async findAdminNameOrThrow(userId) {
        const admin = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true } });
        return admin.name;
    }
}
export const adminDirectory = new PrismaAdminDirectory();
//# sourceMappingURL=PrismaAdminDirectory.js.map