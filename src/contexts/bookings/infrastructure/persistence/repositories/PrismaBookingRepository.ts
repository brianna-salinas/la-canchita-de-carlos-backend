import { prisma } from "../../../../../db.js";
import { Prisma } from "../../../../../../generated/prisma/client.js";
import type {
  BookingRepository,
  NewBookingData,
  SearchFilters,
  BookingWithRelations,
} from "../../../domain/model/ports/BookingRepository.js";
import type { Booking, TimeRange } from "../../../domain/model/aggregates/Booking.js";

type Db = typeof prisma | Prisma.TransactionClient;

function toBooking(row: any): Booking {
  return {
    ...row,
    totalAmount: Number(row.totalAmount),
    paidAmount: Number(row.paidAmount),
  };
}

export class PrismaBookingRepository implements BookingRepository {
  constructor(private readonly db: Db = prisma) {}

  async runTransaction<T>(fn: (tx: BookingRepository) => Promise<T>): Promise<T> {
    return prisma.$transaction((tx) => fn(new PrismaBookingRepository(tx)));
  }

  async findActiveOverlapCandidates(courtId: number, date: Date): Promise<(TimeRange & { id: number })[]> {
    return this.db.booking.findMany({
      where: { courtId, date, status: "BOOKED" },
      select: { id: true, startTime: true, endTime: true },
    });
  }

  async isTimeBlocked(courtId: number, date: Date, range: TimeRange): Promise<boolean> {
    const blocked = await this.db.scheduleBlock.findFirst({
      where: { courtId, date, time: { gte: range.startTime, lt: range.endTime } },
    });
    return Boolean(blocked);
  }

  async createEmbeddedCustomer(data: { name: string; phone: string; documentNumber?: string }) {
    return this.db.customer.create({ data });
  }

  async create(data: NewBookingData): Promise<Booking> {
    const row = await this.db.booking.create({ data });
    return toBooking(row);
  }

  async update(bookingId: number, data: Partial<NewBookingData>): Promise<Booking> {
    const row = await this.db.booking.update({ where: { id: bookingId }, data });
    return toBooking(row);
  }

  async cancel(bookingId: number): Promise<Booking> {
    const row = await this.db.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } });
    return toBooking(row);
  }

  async findByIdOrThrow(bookingId: number): Promise<Booking> {
    const row = await this.db.booking.findUniqueOrThrow({ where: { id: bookingId } });
    return toBooking(row);
  }

  async search(filters: SearchFilters): Promise<BookingWithRelations[]> {
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
    return rows.map((row) => toBooking(row) as BookingWithRelations);
  }
}

export const bookingRepository: BookingRepository = new PrismaBookingRepository();
