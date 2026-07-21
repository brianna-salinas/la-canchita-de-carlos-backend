import { prisma } from "../../../../db.js";
import type { PaymentRepository } from "../../domain/ports/PaymentRepository.js";
import type { PayableBooking } from "../../domain/model/Payment.js";

// Adaptador de salida: implementa PaymentRepository contra Prisma/PostgreSQL.
export class PrismaPaymentRepository implements PaymentRepository {
  async findBookingOrThrow(bookingId: number): Promise<PayableBooking> {
    const booking = await prisma.booking.findUniqueOrThrow({ where: { id: bookingId } });
    return { id: booking.id, totalAmount: Number(booking.totalAmount), paidAmount: Number(booking.paidAmount) };
  }

  async applyPayment(bookingId: number, newPaidAmount: number, status: "PARTIAL" | "PAID"): Promise<PayableBooking> {
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { paidAmount: newPaidAmount, paymentStatus: status },
    });
    return { id: updated.id, totalAmount: Number(updated.totalAmount), paidAmount: Number(updated.paidAmount) };
  }

  async attachReceipt(bookingId: number, receiptUrl: string): Promise<PayableBooking> {
    const updated = await prisma.booking.update({ where: { id: bookingId }, data: { receiptUrl } });
    return { id: updated.id, totalAmount: Number(updated.totalAmount), paidAmount: Number(updated.paidAmount) };
  }
}

export const paymentRepository: PaymentRepository = new PrismaPaymentRepository();
