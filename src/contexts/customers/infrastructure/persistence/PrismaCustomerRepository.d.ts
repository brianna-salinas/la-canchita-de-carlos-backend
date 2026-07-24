import type { CustomerRepository, NewCustomerData, CustomerHistoryEntry } from "../../domain/ports/CustomerRepository.js";
import type { Customer } from "../../domain/model/Customer.js";
export declare class PrismaCustomerRepository implements CustomerRepository {
    create(data: NewCustomerData): Promise<Customer>;
    update(customerId: number, data: Partial<NewCustomerData>): Promise<Customer>;
    deactivate(customerId: number): Promise<Customer>;
    list(search?: string): Promise<Customer[]>;
    getBookingHistory(customerId: number): Promise<CustomerHistoryEntry[]>;
    updatePhoto(customerId: number, photoUrl: string): Promise<Customer>;
}
export declare const customerRepository: CustomerRepository;
//# sourceMappingURL=PrismaCustomerRepository.d.ts.map