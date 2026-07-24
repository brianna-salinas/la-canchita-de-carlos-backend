// US05 — cancelar un alquiler, liberando la franja de inmediato.
export function makeCancelBooking(deps) {
    return function cancelBooking(bookingId) {
        return deps.bookings.cancel(bookingId);
    };
}
//# sourceMappingURL=cancelBooking.usecase.js.map