import { prisma } from "../../../../db.js";
import { Prisma } from "../../../../../generated/prisma/client.js";
import type {
  BookingRepository,
  NewBookingData,
  SearchFilters,
  BookingWithRelations,
} from "../../domain/ports/BookingRepository.js";
import type { Booking, TimeRange } from "../../domain/model/Booking.js";

type Db = typeof prisma | Prisma.TransactionClient;

// Adaptador de salida (anillo "Infraestructura" de 4.0): implementa BookingRepository
// contra Prisma/PostgreSQL. Si el negocio cambia de ORM, solo se reemplaza esta clase.
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
    return this.db.booking.create({ data }) as Promise<Booking>;
  }

  async update(bookingId: number, data: Partial<NewBookingData>): Promise<Booking> {
    return this.db.booking.update({ where: { id: bookingId }, data }) as Promise<Booking>;
  }

  async cancel(bookingId: number): Promise<Booking> {
    return this.db.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } }) as Promise<Booking>;
  }

  async findByIdOrThrow(bookingId: number): Promise<Booking> {
    return this.db.booking.findUniqueOrThrow({ where: { id: bookingId } }) as Promise<Booking>;
  }

  async search(filters: SearchFilters): Promise<BookingWithRelations[]> {
    return this.db.booking.findMany({
      where: {
        courtId: filters.courtId,
        customerId: filters.customerId,
        status: filters.status,
        date: { gte: filters.from, lte: filters.to },
      },
      orderBy: { date: "desc" },
      include: { court: true, customer: true },
    }) as Promise<BookingWithRelations[]>;
  }
}

export const bookingRepository: BookingRepository = new PrismaBookingRepository();
