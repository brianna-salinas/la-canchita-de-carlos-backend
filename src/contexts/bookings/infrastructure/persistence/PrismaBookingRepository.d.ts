import { prisma } from "../../../../db.js";
import { Prisma } from "../../../../../generated/prisma/client.js";
import type { BookingRepository, NewBookingData, SearchFilters, BookingWithRelations } from "../../domain/ports/BookingRepository.js";
import type { Booking, TimeRange } from "../../domain/model/Booking.js";
type Db = typeof prisma | Prisma.TransactionClient;
export declare class PrismaBookingRepository implements BookingRepository {
    private readonly db;
    constructor(db?: Db);
    runTransaction<T>(fn: (tx: BookingRepository) => Promise<T>): Promise<T>;
    findActiveOverlapCandidates(courtId: number, date: Date): Promise<(TimeRange & {
        id: number;
    })[]>;
    isTimeBlocked(courtId: number, date: Date, range: TimeRange): Promise<boolean>;
    createEmbeddedCustomer(data: {
        name: string;
        phone: string;
        documentNumber?: string;
    }): Promise<{
        id: number;
        name: string;
        phone: string;
        documentNumber: string | null;
        status: import("../../../../../generated/prisma/enums.js").CustomerStatus;
        photoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(data: NewBookingData): Promise<Booking>;
    update(bookingId: number, data: Partial<NewBookingData>): Promise<Booking>;
    cancel(bookingId: number): Promise<Booking>;
    findByIdOrThrow(bookingId: number): Promise<Booking>;
    search(filters: SearchFilters): Promise<BookingWithRelations[]>;
}
export declare const bookingRepository: BookingRepository;
export {};
//# sourceMappingURL=PrismaBookingRepository.d.ts.map