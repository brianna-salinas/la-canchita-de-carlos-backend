import { prisma } from "../../../../../db.js";
import type {
  EmailVerificationTokenRepository,
  EmailVerificationToken,
} from "../../../domain/model/ports/EmailVerificationTokenRepository.js";

export class PrismaEmailVerificationTokenRepository implements EmailVerificationTokenRepository {
  async create(data: { userId: number; tokenHash: string; expiresAt: Date }): Promise<void> {
    await prisma.emailVerificationToken.create({ data });
  }

  async findByTokenHash(tokenHash: string): Promise<EmailVerificationToken | null> {
    return prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
  }

  async markUsedAndActivateUser(tokenId: number, userId: number): Promise<void> {
    await prisma.$transaction([
      prisma.emailVerificationToken.update({ where: { id: tokenId }, data: { used: true } }),
      prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE" } }),
    ]);
  }
}

export const emailVerificationTokenRepository: EmailVerificationTokenRepository =
  new PrismaEmailVerificationTokenRepository();
