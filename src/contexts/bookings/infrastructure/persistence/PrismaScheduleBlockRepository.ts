import { prisma } from "../../../../db.js";
import type { ScheduleBlockRepository } from "../../domain/ports/ScheduleBlockRepository.js";
import type { ScheduleBlock } from "../../domain/model/ScheduleBlock.js";

// Adaptador de salida: implementa ScheduleBlockRepository contra Prisma/PostgreSQL.
export class PrismaScheduleBlockRepository implements ScheduleBlockRepository {
  async createMany(courtId: number, date: Date, times: Date[], reason?: string): Promise<ScheduleBlock[]> {
    return prisma.$transaction(times.map((time) => prisma.scheduleBlock.create({ data: { courtId, date, time, reason } })));
  }

  async listForCourtAndDate(courtId: number, date: Date): Promise<ScheduleBlock[]> {
    return prisma.scheduleBlock.findMany({ where: { courtId, date }, orderBy: { time: "asc" } });
  }

  async deleteById(blockId: number): Promise<void> {
    await prisma.scheduleBlock.delete({ where: { id: blockId } });
  }
}

export const scheduleBlockRepository: ScheduleBlockRepository = new PrismaScheduleBlockRepository();
