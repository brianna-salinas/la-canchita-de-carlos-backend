import type { CustomerRepository } from "../domain/ports/CustomerRepository.js";
export declare function makeListCustomers(deps: {
    customers: CustomerRepository;
}): (search?: string) => Promise<import("../domain/model/Customer.js").Customer[]>;
//# sourceMappingURL=listCustomers.usecase.d.ts.map