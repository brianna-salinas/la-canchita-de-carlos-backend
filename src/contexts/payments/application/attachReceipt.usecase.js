// TS08 — adjunta el comprobante de un pago (RF25/US27), sube la imagen a Supabase Storage.
export function makeAttachReceipt(deps) {
    return async function attachReceipt(bookingId, file) {
        const result = await deps.storage.upload({
            folder: "comprobantes",
            buffer: file.buffer,
            mimeType: file.mimetype,
            originalName: file.originalname,
        });
        // Bucket "comprobantes" es privado: guardamos la ruta interna, no una URL publica.
        return deps.payments.attachReceipt(bookingId, result.path);
    };
}
//# sourceMappingURL=attachReceipt.usecase.js.map