import { prisma } from "../../../../db.js";
function toSummary(b) {
    return {
        id: b.id,
        startTime: b.startTime,
        endTime: b.endTime,
        totalAmount: Number(b.totalAmount),
        paidAmount: Number(b.paidAmount),
        paymentStatus: b.paymentStatus,
        court: { id: b.court.id, name: b.court.name },
        customer: b.customer ? { id: b.customer.id, name: b.customer.name } : null,
    };
}
// Adaptador de salida: implementa PanelRepository (reporting) contra Prisma/PostgreSQL.
export class PrismaPanelRepository {
    async getBookingsForDate(date) {
        const bookings = await prisma.booking.findMany({
            where: { date, status: { not: "CANCELLED" } },
            include: { court: true, customer: true },
            orderBy: { startTime: "asc" },
        });
        return bookings.map(toSummary);
    }
    async getPaidTotalForDate(date) {
        const result = await prisma.booking.aggregate({
            where: { date, status: { not: "CANCELLED" } },
            _sum: { paidAmount: true },
        });
        return Number(result._sum.paidAmount ?? 0);
    }
    async getPendingPaymentsForDate(date) {
        const bookings = await prisma.booking.findMany({
            where: { date, status: { not: "CANCELLED" }, paymentStatus: { in: ["PENDING", "PARTIAL"] } },
            include: { court: true, customer: true },
        });
        return bookings.map(toSummary);
    }
}
export const panelRepository = new PrismaPanelRepository();
//# sourceMappingURL=PrismaPanelRepository.js.map