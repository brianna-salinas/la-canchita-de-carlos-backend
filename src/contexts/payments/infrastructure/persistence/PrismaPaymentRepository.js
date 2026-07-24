import { prisma } from "../../../../db.js";
function toPayableBooking(b) {
    return { id: b.id, totalAmount: Number(b.totalAmount), paidAmount: Number(b.paidAmount) };
}
function toPayment(p) {
    return { id: p.id, bookingId: p.bookingId, amount: Number(p.amount), method: p.method, createdAt: p.createdAt };
}
// Adaptador de salida: implementa PaymentRepository contra Prisma/PostgreSQL.
export class PrismaPaymentRepository {
    async findBookingOrThrow(bookingId) {
        const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
        return toPayableBooking(booking);
    }
    async registerPaymentAtomic(bookingId, amount, method, newPaidAmount, status) {
        const [payment, booking] = await prisma.$transaction([
            prisma.payment.create({ data: { bookingId, amount, method } }),
            prisma.booking.update({ where: { id: bookingId }, data: { paidAmount: newPaidAmount, paymentStatus: status } }),
        ]);
        return { booking: toPayableBooking(booking), payment: toPayment(payment) };
    }
    async listPaymentsForBooking(bookingId) {
        const payments = await prisma.payment.findMany({ where: { bookingId }, orderBy: { createdAt: "asc" } });
        return payments.map(toPayment);
    }
    async attachReceipt(bookingId, receiptPath) {
        const updated = await prisma.booking.update({ where: { id: bookingId }, data: { receiptUrl: receiptPath } });
        return toPayableBooking(updated);
    }
    async getReceiptPath(bookingId) {
        const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId }, select: { receiptUrl: true } });
        return booking.receiptUrl;
    }
}
export const paymentRepository = new PrismaPaymentRepository();
//# sourceMappingURL=PrismaPaymentRepository.js.map