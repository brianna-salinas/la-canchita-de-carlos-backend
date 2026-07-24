import { prisma } from "../../../../../db.js";
import type { CourtRepository, NewCourtData, UpdateCourtData, CourtAvailability } from "../../../domain/model/ports/CourtRepository.js";
import type { Court } from "../../../domain/model/aggregates/Court.js";

function toCourt(row: any): Court {
  return { ...row, pricePerHour: Number(row.pricePerHour) };
}

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

  async delete(courtId: number): Promise<void> {
    await prisma.court.delete({ where: { id: courtId } });
  }

  async listAll(): Promise<Court[]> {
    const rows = await prisma.court.findMany({ orderBy: { name: "asc" } });
    return rows.map(toCourt);
  }

  async updatePhoto(courtId: number, photoUrl: string): Promise<Court> {
    const row = await prisma.court.update({ where: { id: courtId }, data: { photoUrl } });
    return toCourt(row);
  }

  async getConsolidatedAvailability(date: Date): Promise<CourtAvailability[]> {
    const rows = await prisma.court.findMany({

      where: { enabled: true, status: "ACTIVE" },
      include: {
        bookings: { where: { date, status: "BOOKED" } },
        scheduleBlocks: { where: { date } },
      },
    });

    return rows.map((row) => ({ ...toCourt(row), bookings: row.bookings, scheduleBlocks: row.scheduleBlocks })) as unknown as CourtAvailability[];
  }

  async findByIdOrThrow(courtId: number): Promise<Court> {
    const row = await prisma.court.findUniqueOrThrow({ where: { id: courtId } });
    return toCourt(row);
  }
}

export const courtRepository: CourtRepository = new PrismaCourtRepository();
