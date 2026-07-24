// US16 — historial de pagos (con metodo) de un alquiler, para mostrar trazabilidad.
export function makeListPaymentsForBooking(deps) {
    return function listPaymentsForBooking(bookingId) {
        return deps.payments.listPaymentsForBooking(bookingId);
    };
}
//# sourceMappingURL=listPaymentsForBooking.usecase.js.map