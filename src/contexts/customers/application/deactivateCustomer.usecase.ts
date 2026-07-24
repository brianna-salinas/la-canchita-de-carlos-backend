import type { CustomerRepository } from "../domain/model/ports/CustomerRepository.js";

export function makeDeactivateCustomer(deps: { customers: CustomerRepository }) {
  return function deactivateCustomer(customerId: number) {
    return deps.customers.deactivate(customerId);
  };
}
