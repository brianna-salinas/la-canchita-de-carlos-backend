import type { CustomerRepository, NewCustomerData } from "../domain/ports/CustomerRepository.js";
export declare function makeRegisterCustomer(deps: {
    customers: CustomerRepository;
}): (input: NewCustomerData) => Promise<import("../domain/model/Customer.js").Customer>;
//# sourceMappingURL=registerCustomer.usecase.d.ts.map