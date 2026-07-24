import { prisma } from "../../../../db.js";
// Adaptador de salida: implementa EmailVerificationTokenRepository contra Prisma/PostgreSQL (RF34/TS11).
export class PrismaEmailVerificationTokenRepository {
    async create(data) {
        await prisma.emailVerificationToken.create({ data });
    }
    async findByTokenHash(tokenHash) {
        return prisma.emailVerificationToken.findUnique({ where: { tokenHash } });
    }
    async markUsedAndActivateUser(tokenId, userId) {
        await prisma.$transaction([
            prisma.emailVerificationToken.update({ where: { id: tokenId }, data: { used: true } }),
            prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE" } }),
        ]);
    }
}
export const emailVerificationTokenRepository = new PrismaEmailVerificationTokenRepository();
//# sourceMappingURL=PrismaEmailVerificationTokenRepository.js.map