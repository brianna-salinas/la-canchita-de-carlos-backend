import { prisma } from "../../../../db.js";
import type {
  CustomerRepository,
  NewCustomerData,
  CustomerHistoryEntry,
} from "../../domain/ports/CustomerRepository.js";
import type { Customer } from "../../domain/model/Customer.js";

// Adaptador de salida: implementa CustomerRepository contra Prisma/PostgreSQL.
export class PrismaCustomerRepository implements CustomerRepository {
  async create(data: NewCustomerData): Promise<Customer> {
    return prisma.customer.create({ data });
  }

  async update(customerId: number, data: Partial<NewCustomerData>): Promise<Customer> {
    return prisma.customer.update({ where: { id: customerId }, data });
  }

  async deactivate(customerId: number): Promise<Customer> {
    return prisma.customer.update({ where: { id: customerId }, data: { status: "INACTIVE" } });
  }

  async list(search?: string): Promise<Customer[]> {
    return prisma.customer.findMany({
      where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
      orderBy: { name: "asc" },
    });
  }

  async getBookingHistory(customerId: number): Promise<CustomerHistoryEntry[]> {
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
}

export const customerRepository: CustomerRepository = new PrismaCustomerRepository();
