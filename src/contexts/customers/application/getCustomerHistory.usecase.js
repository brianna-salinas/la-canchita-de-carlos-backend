// US10 — historial de alquileres de un cliente.
export function makeGetCustomerHistory(deps) {
    return function getCustomerHistory(customerId) {
        return deps.customers.getBookingHistory(customerId);
    };
}
//# sourceMappingURL=getCustomerHistory.usecase.js.map