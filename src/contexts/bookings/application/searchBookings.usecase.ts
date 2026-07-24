import type { BookingRepository, SearchFilters } from "../domain/model/ports/BookingRepository.js";

// US08 — buscar/filtrar historial de alquileres.
export function makeSearchBookings(deps: { bookings: BookingRepository }) {
  return function searchBookings(filters: SearchFilters) {
    return deps.bookings.search(filters);
  };
}
