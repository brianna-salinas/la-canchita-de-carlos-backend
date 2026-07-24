// TS10 — foto de perfil de un admin/dueno. Carpeta publica "perfiles".
export function makeUploadUserPhoto(deps) {
    return async function uploadUserPhoto(userId, file) {
        const result = await deps.storage.upload({
            folder: "perfiles",
            buffer: file.buffer,
            mimeType: file.mimetype,
            originalName: file.originalname,
        });
        // El bucket es privado: se guarda la ruta, no una URL (se convierte a
        // signed URL al leer, ver platform/storage/photoUrl.helper.ts).
        return deps.users.updatePhoto(userId, result.path);
    };
}
//# sourceMappingURL=uploadUserPhoto.usecase.js.map