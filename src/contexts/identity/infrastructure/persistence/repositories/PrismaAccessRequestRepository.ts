import { prisma } from "../../../../../db.js";
import type { AccessRequestRepository, NewAccessRequestData } from "../../../domain/model/ports/AccessRequestRepository.js";
import type { AccessRequest } from "../../../domain/model/aggregates/AccessRequest.js";
import { HttpError } from "../../../../../platform/errors/HttpError.js";

export class PrismaAccessRequestRepository implements AccessRequestRepository {
  async findByEmailPending(email: string): Promise<AccessRequest | null> {
    return prisma.accessRequest.findFirst({ where: { email, status: "PENDING" } });
  }

  async create(data: NewAccessRequestData): Promise<AccessRequest> {
    return prisma.accessRequest.create({ data });
  }

  async findByIdOrThrow(requestId: number): Promise<AccessRequest> {
    const request = await prisma.accessRequest.findUnique({ where: { id: requestId } });
    if (!request) {
      throw new HttpError(404, "Solicitud no encontrada.");
    }
    return request;
  }

  async markApproved(requestId: number, createdUserId: number): Promise<void> {
    await prisma.accessRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED", createdUserId, resolvedAt: new Date() },
    });
  }

  async markRejected(requestId: number): Promise<void> {
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

export const accessRequestRepository: AccessRequestRepository = new PrismaAccessRequestRepository();
