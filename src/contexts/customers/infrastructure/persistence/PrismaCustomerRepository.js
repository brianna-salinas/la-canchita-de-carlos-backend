import { prisma } from "../../../../db.js";
// Adaptador de salida: implementa CustomerRepository contra Prisma/PostgreSQL.
export class PrismaCustomerRepository {
    async create(data) {
        return prisma.customer.create({ data });
    }
    async update(customerId, data) {
        return prisma.customer.update({ where: { id: customerId }, data });
    }
    async deactivate(customerId) {
        return prisma.customer.update({ where: { id: customerId }, data: { status: "INACTIVE" } });
    }
    async list(search) {
        return prisma.customer.findMany({
            where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
            orderBy: { name: "asc" },
        });
    }
    async getBookingHistory(customerId) {
        const bookings = await prisma.booking.findMany({
            where: { customerId },
            orderBy: { date: "desc" },
            include: { court: true },
        });
        return bookings.map((b) => ({
            id: b.id,
            date: b.date,
            startTime: b.startTime,
            endTime: b.endTime,
            totalAmount: Number(b.totalAmount),
            paidAmount: Number(b.paidAmount),
            court: { id: b.court.id, name: b.court.name },
        }));
    }
    async updatePhoto(customerId, photoUrl) {
        return prisma.customer.update({ where: { id: customerId }, data: { photoUrl } });
    }
}
export const customerRepository = new PrismaCustomerRepository();
//# sourceMappingURL=PrismaCustomerRepository.js.map