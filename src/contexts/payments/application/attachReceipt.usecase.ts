import type { PaymentRepository } from "../domain/ports/PaymentRepository.js";
import type { FileStorage } from "../../../platform/storage/ports/FileStorage.js";

// TS08 — adjunta el comprobante de un pago (RF25/US27), sube la imagen a Supabase Storage.
export function makeAttachReceipt(deps: { payments: PaymentRepository; storage: FileStorage }) {
  return async function attachReceipt(
    bookingId: number,
    file: { buffer: Buffer; mimetype: string; originalname: string }
  ) {
    const url = await deps.storage.upload({
      folder: "comprobantes",
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });
    return deps.payments.attachReceipt(bookingId, url);
  };
}
