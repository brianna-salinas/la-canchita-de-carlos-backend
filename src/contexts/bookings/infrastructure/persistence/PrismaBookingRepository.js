import { prisma } from "../../../../db.js";
import { Prisma } from "../../../../../generated/prisma/client.js";
function toBooking(row) {
    return {
        ...row,
        totalAmount: Number(row.totalAmount),
        paidAmount: Number(row.paidAmount),
    };
}
// Adaptador de salida : implementa BookingRepository
// contra Prisma/PostgreSQL. Si el negocio cambia de ORM, solo se reemplaza esta clase.
export class PrismaBookingRepository {
    db;
    constructor(db = prisma) {
        this.db = db;
    }
    async runTransaction(fn) {
        return prisma.$transaction((tx) => fn(new PrismaBookingRepository(tx)));
    }
    async findActiveOverlapCandidates(courtId, date) {
        return this.db.booking.findMany({
            where: { courtId, date, status: "BOOKED" },
            select: { id: true, startTime: true, endTime: true },
        });
    }
    async isTimeBlocked(courtId, date, range) {
        const blocked = await this.db.scheduleBlock.findFirst({
            where: { courtId, date, time: { gte: range.startTime, lt: range.endTime } },
        });
        return Boolean(blocked);
    }
    async createEmbeddedCustomer(data) {
        return this.db.customer.create({ data });
    }
    async create(data) {
        const row = await this.db.booking.create({ data });
        return toBooking(row);
    }
    async update(bookingId, data) {
        const row = await this.db.booking.update({ where: { id: bookingId }, data });
        return toBooking(row);
    }
    async cancel(bookingId) {
        const row = await this.db.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });
        return toBooking(row);
    }
    async findByIdOrThrow(bookingId) {
        const row = await this.db.booking.findUniqueOrThrow({ where: { id: bookingId } });
        return toBooking(row);
    }
    async search(filters) {
        const rows = await this.db.booking.findMany({
            where: {
                courtId: filters.courtId,
                customerId: filters.customerId,
                status: filters.status,
                date: { gte: filters.from, lte: filters.to },
            },
            orderBy: { date: "desc" },
            include: { court: true, customer: true },
        });
        return rows.map((row) => toBooking(row));
    }
}
export const bookingRepository = new PrismaBookingRepository();
//# sourceMappingURL=PrismaBookingRepository.js.map