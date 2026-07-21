import type { PaymentRepository } from "../domain/ports/PaymentRepository.js";
import type { FileStorage } from "../../../platform/storage/ports/FileStorage.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

const DEFAULT_EXPIRES_IN_SECONDS = 300; // 5 minutos: suficiente para ver/descargar el comprobante.

// TS08 — genera un enlace temporal para ver un comprobante guardado en el bucket privado.
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
