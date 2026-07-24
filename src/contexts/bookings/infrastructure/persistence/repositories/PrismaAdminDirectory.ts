import { prisma } from "../../../../../db.js";
import type { AdminDirectory, AdminSummary } from "../../../domain/model/ports/AdminDirectory.js";

export class PrismaAdminDirectory implements AdminDirectory {
  async listOtherActiveAdmins(excludeUserId?: number): Promise<AdminSummary[]> {
    const admins = await prisma.user.findMany({
      where: { status: "ACTIVE", id: excludeUserId ? { not: excludeUserId } : undefined },
      select: { id: true, email: true },
    });
    return admins;
  }

  async findAdminNameOrThrow(userId: number): Promise<string> {
    const admin = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true } });
    return admin.name;
  }
}

export const adminDirectory: AdminDirectory = new PrismaAdminDirectory();
