import type { PaymentRepository } from "../domain/ports/PaymentRepository.js";
import type { FileStorage } from "../../../platform/storage/ports/FileStorage.js";
export declare function makeAttachReceipt(deps: {
    payments: PaymentRepository;
    storage: FileStorage;
}): (bookingId: number, file: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}) => Promise<import("../domain/model/Payment.js").PayableBooking>;
//# sourceMappingURL=attachReceipt.usecase.d.ts.map