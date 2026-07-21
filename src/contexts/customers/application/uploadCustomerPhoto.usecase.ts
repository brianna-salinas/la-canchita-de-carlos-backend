import type { CustomerRepository } from "../domain/ports/CustomerRepository.js";
import type { FileStorage } from "../../../platform/storage/ports/FileStorage.js";

// TS10 (analogo) — foto de un cliente. Carpeta publica "clientes".
export function makeUploadCustomerPhoto(deps: { customers: CustomerRepository; storage: FileStorage }) {
  return async function uploadCustomerPhoto(
    customerId: number,
    file: { buffer: Buffer; mimetype: string; originalname: string }
  ) {
    const result = await deps.storage.upload({
      folder: "clientes",
      buffer: file.buffer,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });
    return deps.customers.updatePhoto(customerId, result.url!);
  };
}
