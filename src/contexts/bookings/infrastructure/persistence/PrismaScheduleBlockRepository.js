import { prisma } from "../../../../db.js";
// Adaptador de salida: implementa ScheduleBlockRepository contra Prisma/PostgreSQL.
export class PrismaScheduleBlockRepository {
    async createMany(courtId, date, times, reason) {
        return prisma.$transaction(times.map((time) => prisma.scheduleBlock.create({ data: { courtId, date, time, reason } })));
    }
    async listForCourtAndDate(courtId, date) {
        return prisma.scheduleBlock.findMany({ where: { courtId, date }, orderBy: { time: "asc" } });
    }
    async listUpcomingForCourt(courtId, fromDate) {
        return prisma.scheduleBlock.findMany({
            where: { courtId, date: { gte: fromDate } },
            orderBy: [{ date: "asc" }, { time: "asc" }],
        });
    }
    async deleteById(blockId) {
        await prisma.scheduleBlock.delete({ where: { id: blockId } });
    }
}
export const scheduleBlockRepository = new PrismaScheduleBlockRepository();
//# sourceMappingURL=PrismaScheduleBlockRepository.js.map