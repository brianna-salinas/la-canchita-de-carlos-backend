// US09 (escenario 2) — eliminar = marcar INACTIVE, para no romper la trazabilidad de bookings historicos.
export function makeDeactivateCustomer(deps) {
    return function deactivateCustomer(customerId) {
        return deps.customers.deactivate(customerId);
    };
}
//# sourceMappingURL=deactivateCustomer.usecase.js.map