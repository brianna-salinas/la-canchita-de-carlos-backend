import type { CustomerRepository } from "../domain/ports/CustomerRepository.js";

// US09 — listar/buscar clientes.
export function makeListCustomers(deps: { customers: CustomerRepository }) {
  return function listCustomers(search?: string) {
    return deps.customers.list(search);
  };
}
