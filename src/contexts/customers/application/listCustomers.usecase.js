// US09 — listar/buscar clientes.
export function makeListCustomers(deps) {
    return function listCustomers(search) {
        return deps.customers.list(search);
    };
}
//# sourceMappingURL=listCustomers.usecase.js.map