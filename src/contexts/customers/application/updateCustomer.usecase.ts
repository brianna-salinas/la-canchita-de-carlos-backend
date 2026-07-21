import type { CustomerRepository, NewCustomerData } from "../domain/ports/CustomerRepository.js";

// US09 — editar un cliente.
export function makeUpdateCustomer(deps: { customers: CustomerRepository }) {
  return function updateCustomer(customerId: number, input: Partial<NewCustomerData>) {
    return deps.customers.update(customerId, input);
  };
}
