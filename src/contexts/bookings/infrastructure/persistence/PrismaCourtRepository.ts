import { prisma } from "../../../../db.js";
import type { CourtRepository, NewCourtData, UpdateCourtData, CourtAvailability } from "../../domain/ports/CourtRepository.js";
import type { Court } from "../../domain/model/Court.js";

function toCourt(row: any): Court {
  return { ...row, pricePerHour: Number(row.pricePerHour) };
}

// Adaptador de salida: implementa CourtRepository contra Prisma/PostgreSQL.
export class PrismaCourtRepository implements CourtRepository {
  async findByName(name: string): Promise<Court | null> {
    const row = await prisma.court.findFirst({ where: { name } });
    return row ? toCourt(row) : null;
  }

  async create(data: NewCourtData): Promise<Court> {
    const row = await prisma.court.create({ data });
    return toCourt(row);
  }

  async update(courtId: number, data: UpdateCourtData): Promise<Court> {
    const row = await prisma.court.update({ where: { id: courtId }, data });
    return toCourt(row);
  }

  async updatePrice(courtId: number, pricePerHour: number): Promise<Court> {
    const row = await prisma.court.update({ where: { id: courtId }, data: { pricePerHour } });
    return toCourt(row);
  }

  async deactivate(courtId: number): Promise<Court> {
    const row = await prisma.court.update({ where: { id: courtId }, data: { enabled: false } });
    return toCourt(row);
  }

  async updatePhoto(courtId: number, photoUrl: string): Promise<Court> {
    const row = await prisma.court.update({ where: { id: courtId }, data: { photoUrl } });
    return toCourt(row);
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
    const row = await prisma.court.findUniqueOrThrow({ where: { id: courtId } });
    return toCourt(row);
  }
}

export const courtRepository: CourtRepository = new PrismaCourtRepository();
