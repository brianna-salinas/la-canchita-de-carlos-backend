// TS10 — subir una foto de una cancha (RF31).
export function makeAddCourtPhoto(deps) {
    return async function addCourtPhoto(courtId, file) {
        const result = await deps.storage.upload({
            folder: "canchas",
            buffer: file.buffer,
            mimeType: file.mimetype,
            originalName: file.originalname,
        });
        // El bucket es privado: se guarda la ruta, no una URL (se convierte a
        // signed URL al leer, ver platform/storage/photoUrl.helper.ts).
        return deps.courts.updatePhoto(courtId, result.path);
    };
}
//# sourceMappingURL=addCourtPhoto.usecase.js.map