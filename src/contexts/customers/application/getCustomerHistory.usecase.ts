import type { CustomerRepository } from "../domain/ports/CustomerRepository.js";

// US10 — historial de alquileres de un cliente.
export function makeGetCustomerHistory(deps: { customers: CustomerRepository }) {
  return function getCustomerHistory(customerId: number) {
    return deps.customers.getBookingHistory(customerId);
  };
}
