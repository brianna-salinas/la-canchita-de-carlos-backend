// US08 — buscar/filtrar historial de alquileres.
export function makeSearchBookings(deps) {
    return function searchBookings(filters) {
        return deps.bookings.search(filters);
    };
}
//# sourceMappingURL=searchBookings.usecase.js.map