import type { BookingRepository, SearchFilters } from "../domain/ports/BookingRepository.js";
export declare function makeSearchBookings(deps: {
    bookings: BookingRepository;
}): (filters: SearchFilters) => Promise<import("../domain/ports/BookingRepository.js").BookingWithRelations[]>;
//# sourceMappingURL=searchBookings.usecase.d.ts.map