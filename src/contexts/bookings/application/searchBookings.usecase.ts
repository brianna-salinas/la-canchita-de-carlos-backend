import type { BookingRepository, SearchFilters } from "../domain/model/ports/BookingRepository.js";

export function makeSearchBookings(deps: { bookings: BookingRepository }) {
  return function searchBookings(filters: SearchFilters) {
    return deps.bookings.search(filters);
  };
}
