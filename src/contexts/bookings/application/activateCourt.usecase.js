// DEPRECADO: la reactivación tenía sentido solo mientras "eliminar" era un
// soft-delete. Ahora que "eliminar cancha" borra la fila de verdad
// (ver deleteCourt.usecase.ts), no hay nada que reactivar tras un borrado.
// Pausar/reanudar una cancha sin borrarla ahora se hace vía
// PATCH /courts/:id con { enabled }, manejado en updateCourt.usecase.ts.
// Este archivo no se puede borrar del repo desde esta sesión (el sandbox no
// permite eliminar archivos en las carpetas conectadas), así que se deja
// vacío de lógica a propósito: no se importa desde ningún lado.
export {};
//# sourceMappingURL=activateCourt.usecase.js.map