import type { CustomerRepository } from "../domain/model/ports/CustomerRepository.js";

// US09 (escenario 2) — eliminar = marcar INACTIVE, para no romper la trazabilidad de bookings historicos.
export function makeDeactivateCustomer(deps: { customers: CustomerRepository }) {
  return function deactivateCustomer(customerId: number) {
    return deps.customers.deactivate(customerId);
  };
}
