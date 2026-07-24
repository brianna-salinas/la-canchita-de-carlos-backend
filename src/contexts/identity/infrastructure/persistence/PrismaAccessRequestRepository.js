import { prisma } from "../../../../db.js";
import { HttpError } from "../../../../platform/errors/HttpError.js";
// Adaptador de salida: implementa AccessRequestRepository contra Prisma/PostgreSQL.
export class PrismaAccessRequestRepository {
    async findByEmailPending(email) {
        return prisma.accessRequest.findFirst({ where: { email, status: "PENDING" } });
    }
    async create(data) {
        return prisma.accessRequest.create({ data });
    }
    async findByIdOrThrow(requestId) {
        const request = await prisma.accessRequest.findUnique({ where: { id: requestId } });
        if (!request) {
            throw new HttpError(404, "Solicitud no encontrada.");
        }
        return request;
    }
    async markApproved(requestId, createdUserId) {
        await prisma.accessRequest.update({
            where: { id: requestId },
            data: { status: "APPROVED", createdUserId, resolvedAt: new Date() },
        });
    }
    async markRejected(requestId) {
        await prisma.accessRequest.update({ where: { id: requestId }, data: { status: "REJECTED", resolvedAt: new Date() } });
    }
    async listPending() {
        return prisma.accessRequest.findMany({
            where: { status: "PENDING" },
            orderBy: { createdAt: "asc" },
            select: { id: true, name: true, email: true, phone: true, createdAt: true },
        });
    }
}
export const accessRequestRepository = new PrismaAccessRequestRepository();
//# sourceMappingURL=PrismaAccessRequestRepository.js.map