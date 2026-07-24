// TS10 (analogo) — foto de un cliente. Carpeta publica "clientes".
export function makeUploadCustomerPhoto(deps) {
    return async function uploadCustomerPhoto(customerId, file) {
        const result = await deps.storage.upload({
            folder: "clientes",
            buffer: file.buffer,
            mimeType: file.mimetype,
            originalName: file.originalname,
        });
        // El bucket es privado: se guarda la ruta, no una URL (se convierte a
        // signed URL al leer, ver platform/storage/photoUrl.helper.ts).
        return deps.customers.updatePhoto(customerId, result.path);
    };
}
//# sourceMappingURL=uploadCustomerPhoto.usecase.js.map