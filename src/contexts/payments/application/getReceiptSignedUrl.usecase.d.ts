import type { PaymentRepository } from "../domain/ports/PaymentRepository.js";
import type { FileStorage } from "../../../platform/storage/ports/FileStorage.js";
export declare function makeGetReceiptSignedUrl(deps: {
    payments: PaymentRepository;
    storage: FileStorage;
}): (bookingId: number) => Promise<{
    url: string;
    expiresInSeconds: number;
}>;
//# sourceMappingURL=getReceiptSignedUrl.usecase.d.ts.map