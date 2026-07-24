import type { CustomerRepository } from "../domain/ports/CustomerRepository.js";
export declare function makeDeactivateCustomer(deps: {
    customers: CustomerRepository;
}): (customerId: number) => Promise<import("../domain/model/Customer.js").Customer>;
//# sourceMappingURL=deactivateCustomer.usecase.d.ts.map