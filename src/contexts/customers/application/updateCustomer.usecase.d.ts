import type { CustomerRepository, NewCustomerData } from "../domain/ports/CustomerRepository.js";
export declare function makeUpdateCustomer(deps: {
    customers: CustomerRepository;
}): (customerId: number, input: Partial<NewCustomerData>) => Promise<import("../domain/model/Customer.js").Customer>;
//# sourceMappingURL=updateCustomer.usecase.d.ts.map