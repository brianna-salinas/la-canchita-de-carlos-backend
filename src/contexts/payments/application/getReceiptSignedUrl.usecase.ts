import type { PaymentRepository } from "../domain/model/ports/PaymentRepository.js";
import type { FileStorage } from "../../../platform/storage/ports/FileStorage.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

const DEFAULT_EXPIRES_IN_SECONDS = 300;

export function makeGetReceiptSignedUrl(deps: { payments: PaymentRepository; storage: FileStorage }) {
  return async function getReceiptSignedUrl(bookingId: number) {
    const path = await deps.payments.getReceiptPath(bookingId);
    if (!path) {
      throw new HttpError(404, "Este alquiler no tiene ningun comprobante adjunto.");
    }
    const url = await deps.storage.createSignedUrl(path, DEFAULT_EXPIRES_IN_SECONDS);
    return { url, expiresInSeconds: DEFAULT_EXPIRES_IN_SECONDS };
  };
}
