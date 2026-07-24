import type { CustomerRepository } from "../domain/ports/CustomerRepository.js";
export declare function makeGetCustomerHistory(deps: {
    customers: CustomerRepository;
}): (customerId: number) => Promise<import("../domain/ports/CustomerRepository.js").CustomerHistoryEntry[]>;
//# sourceMappingURL=getCustomerHistory.usecase.d.ts.map