import { prisma } from "../../../../../db.js";
import type {
  PasswordResetTokenRepository,
  PasswordResetToken,
} from "../../../domain/model/ports/PasswordResetTokenRepository.js";

export class PrismaPasswordResetTokenRepository implements PasswordResetTokenRepository {
  async create(data: { userId: number; tokenHash: string; expiresAt: Date }): Promise<void> {
    await prisma.passwordResetToken.create({ data });
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  }

  async markUsedAndUpdatePassword(tokenId: number, userId: number, passwordHash: string): Promise<void> {
    await prisma.$transaction([
      prisma.passwordResetToken.update({ where: { id: tokenId }, data: { used: true } }),
      prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
    ]);
  }
}

export const passwordResetTokenRepository: PasswordResetTokenRepository =
  new PrismaPasswordResetTokenRepository();
