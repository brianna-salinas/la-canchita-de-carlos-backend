import { prisma } from "../../../../db.js";
import type { CourtRepository, NewCourtData, CourtAvailability } from "../../domain/ports/CourtRepository.js";
import type { Court } from "../../domain/model/Court.js";

// Adaptador de salida: implementa CourtRepository contra Prisma/PostgreSQL.
export class PrismaCourtRepository implements CourtRepository {
  async findByName(name: string): Promise<Court | null> {
    return prisma.court.findFirst({ where: { name } });
  }

  async create(data: NewCourtData): Promise<Court> {
    return prisma.court.create({ data });
  }

  async updatePrice(courtId: number, pricePerHour: number): Promise<Court> {
    return prisma.court.update({ where: { id: courtId }, data: { pricePerHour } });
  }

  async updatePhoto(courtId: number, photoUrl: string): Promise<Court> {
    return prisma.court.update({ where: { id: courtId }, data: { photoUrl } });
  }

  async getConsolidatedAvailability(date: Date): Promise<CourtAvailability[]> {
    return prisma.court.findMany({
      include: {
        bookings: { where: { date, status: "BOOKED" } },
        scheduleBlocks: { where: { date } },
      },
    }) as unknown as Promise<CourtAvailability[]>;
  }

  async findByIdOrThrow(courtId: number): Promise<Court> {
    return prisma.court.findUniqueOrThrow({ where: { id: courtId } });
  }
}

export const courtRepository: CourtRepository = new PrismaCourtRepository();
