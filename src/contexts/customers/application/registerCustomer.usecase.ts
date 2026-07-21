import type { CustomerRepository, NewCustomerData } from "../domain/ports/CustomerRepository.js";

// US09 — registrar un cliente nuevo.
export function makeRegisterCustomer(deps: { customers: CustomerRepository }) {
  return function registerCustomer(input: NewCustomerData) {
    return deps.customers.create(input);
  };
}
