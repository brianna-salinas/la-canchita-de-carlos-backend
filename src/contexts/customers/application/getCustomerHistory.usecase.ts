import type { CustomerRepository } from "../domain/model/ports/CustomerRepository.js";

export function makeGetCustomerHistory(deps: { customers: CustomerRepository }) {
  return function getCustomerHistory(customerId: number) {
    return deps.customers.getBookingHistory(customerId);
  };
}
