import { prisma } from "../../../../db.js";
// Adaptador de salida: implementa SessionRepository contra Prisma/PostgreSQL.
export class PrismaSessionRepository {
    async create(data) {
        await prisma.session.create({ data });
    }
    async revoke(userId, tokenHash) {
        await prisma.session.updateMany({ where: { userId, tokenHash, revoked: false }, data: { revoked: true } });
    }
    async revokeAllForUser(userId) {
        await prisma.session.updateMany({ where: { userId, revoked: false }, data: { revoked: true } });
    }
}
export const sessionRepository = new PrismaSessionRepository();
//# sourceMappingURL=PrismaSessionRepository.js.map