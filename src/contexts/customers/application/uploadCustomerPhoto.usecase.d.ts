import type { CustomerRepository } from "../domain/ports/CustomerRepository.js";
import type { FileStorage } from "../../../platform/storage/ports/FileStorage.js";
export declare function makeUploadCustomerPhoto(deps: {
    customers: CustomerRepository;
    storage: FileStorage;
}): (customerId: number, file: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}) => Promise<import("../domain/model/Customer.js").Customer>;
//# sourceMappingURL=uploadCustomerPhoto.usecase.d.ts.map