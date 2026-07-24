import type { CustomerRepository } from "../domain/model/ports/CustomerRepository.js";

export function makeListCustomers(deps: { customers: CustomerRepository }) {
  return function listCustomers(search?: string) {
    return deps.customers.list(search);
  };
}
