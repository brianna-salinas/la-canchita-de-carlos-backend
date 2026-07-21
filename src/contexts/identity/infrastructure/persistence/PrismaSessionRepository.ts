import { prisma } from "../../../../db.js";
import type { SessionRepository } from "../../domain/ports/SessionRepository.js";

// Adaptador de salida: implementa SessionRepository contra Prisma/PostgreSQL.
export class PrismaSessionRepository implements SessionRepository {
  async create(data: { userId: number; tokenHash: string; ipAddress?: string; userAgent?: string; expiresAt: Date }): Promise<void> {
    await prisma.session.create({ data });
  }

  async revoke(userId: number, tokenHash: string): Promise<void> {
    await prisma.session.updateMany({ where: { userId, tokenHash, revoked: false }, data: { revoked: true } });
  }

  async revokeAllForUser(userId: number): Promise<void> {
    await prisma.session.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
  }
}

export const sessionRepository: SessionRepository = new PrismaSessionRepository();
