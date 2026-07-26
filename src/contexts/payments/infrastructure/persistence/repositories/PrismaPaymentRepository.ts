import { prisma } from "../../../../../db.js";
import type { PaymentRepository } from "../../../domain/model/ports/PaymentRepository.js";
import type { PayableBooking, Payment, PaymentMethod } from "../../../domain/model/aggregates/Payment.js";

function toPayableBooking(b: { id: number; totalAmount: unknown; paidAmount: unknown }): PayableBooking {
  return { id: b.id, totalAmount: Number(b.totalAmount), paidAmount: Number(b.paidAmount) };
}

function toPayment(p: {
  id: number;
  bookingId: number;
  amount: unknown;
  method: string;
  createdAt: Date;
  reversedAt: Date | null;
}): Payment {
  return {
    id: p.id,
    bookingId: p.bookingId,
    amount: Number(p.amount),
    method: p.method as PaymentMethod,
    createdAt: p.createdAt,
    reversedAt: p.reversedAt,
  };
}

export class PrismaPaymentRepository implements PaymentRepository {
  async findBookingOrThrow(bookingId: number): Promise<PayableBooking> {
    const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    return toPayableBooking(booking);
  }

  async registerPaymentAtomic(
    bookingId: number,
    amount: number,
    method: PaymentMethod,
    newPaidAmount: number,
    status: "PARTIAL" | "PAID"
  ): Promise<{ booking: PayableBooking; payment: Payment }> {
    const [payment, booking] = await prisma.$transaction([
      prisma.payment.create({ data: { bookingId, amount, method } }),
      prisma.booking.update({ where: { id: bookingId }, data: { paidAmount: newPaidAmount, paymentStatus: status } }),
    ]);
    return { booking: toPayableBooking(booking), payment: toPayment(payment) };
  }

  async listPaymentsForBooking(bookingId: number): Promise<Payment[]> {
    const payments = await prisma.payment.findMany({ where: { bookingId }, orderBy: { createdAt: "asc" } });
    return payments.map(toPayment);
  }

  async attachReceipt(bookingId: number, receiptPath: string): Promise<PayableBooking> {
    const updated = await prisma.booking.update({ where: { id: bookingId }, data: { receiptUrl: receiptPath } });
    return toPayableBooking(updated);
  }

  async getReceiptPath(bookingId: number): Promise<string | null> {
    const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId }, select: { receiptUrl: true } });
    return booking.receiptUrl;
  }

  async reverseAllForBooking(bookingId: number): Promise<{ booking: PayableBooking; reversedCount: number }> {
    const [{ count }, booking] = await prisma.$transaction([
      prisma.payment.updateMany({
        where: { bookingId, reversedAt: null },
        data: { reversedAt: new Date() },
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: { paidAmount: 0, paymentStatus: "PENDING" },
      }),
    ]);
    return { booking: toPayableBooking(booking), reversedCount: count };
  }
}

export const paymentRepository: PaymentRepository = new PrismaPaymentRepository();
