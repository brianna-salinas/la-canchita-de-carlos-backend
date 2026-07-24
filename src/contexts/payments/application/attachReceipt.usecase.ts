import type { PaymentRepository } from "../domain/model/ports/PaymentRepository.js";
import type { FileStorage } from "../../../platform/storage/ports/FileStorage.js";

export function makeAttachReceipt(deps: { payments: PaymentRepository; storage: FileStorage }) {
  return async function attachReceipt(
    bookingId: number,
    file: { buffer: Buffer; mimetype: string; originalname: string }
  ) {
    const previousPath = await deps.payments.getReceiptPath(bookingId);

    const result = await deps.storage.upload({
      folder: "comprobantes",
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });

    const updated = await deps.payments.attachReceipt(bookingId, result.path);

    if (previousPath && previousPath !== result.path) {
      try {
        await deps.storage.delete(previousPath);
      } catch {}
    }

    return updated;
  };
}
