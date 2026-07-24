// El bucket de Storage es privado, asi que lo que se guarda en columnas
// tipo "photoUrl" (canchas, perfiles, clientes) es en realidad la RUTA
// dentro del bucket, no una URL usable directamente. Este helper la
// convierte en un signed URL de corta duracion justo antes de responder,
// igual que ya se hacia para los comprobantes de pago. 1 hora alcanza para
// que la foto se vea mientras la pantalla esta abierta; si expira, el
// proximo refetch (React Query) trae una nueva.
const EXPIRES_IN_SECONDS = 3600;
async function resolveOne(storage, path) {
    if (!path)
        return null;
    try {
        return await storage.createSignedUrl(path, EXPIRES_IN_SECONDS);
    }
    catch {
        // Si el archivo ya no existe o el bucket tiene un problema, no tiene
        // sentido tumbar toda la respuesta por una foto: se muestra sin foto.
        return null;
    }
}
// Reemplaza el campo photoUrl (que en la base de datos es una ruta) por un
// signed URL valido, en un solo objeto.
export async function withSignedPhotoUrl(storage, entity) {
    return { ...entity, photoUrl: await resolveOne(storage, entity.photoUrl) };
}
// Igual que withSignedPhotoUrl, pero para una lista.
export async function withSignedPhotoUrls(storage, entities) {
    return Promise.all(entities.map((e) => withSignedPhotoUrl(storage, e)));
}
//# sourceMappingURL=photoUrl.helper.js.map