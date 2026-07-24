import { HttpError } from "../../../platform/errors/HttpError.js";
// US26-US30 — un owner desactiva la cuenta de otro administrador (soft-delete:
// no se borra la fila porque tiene reservas/pagos ligados por FK, se marca
// status=INACTIVE). No se usa para autodesactivarse (ver deactivateOwnAccount)
// ni permite dejar el sistema sin ningun owner activo.
export function makeDeactivateAdmin(deps) {
    return async function deactivateAdmin(actingUserId, targetUserId) {
        if (actingUserId === targetUserId) {
            throw new HttpError(400, "Usa la opcion de eliminar tu propia cuenta para desactivarte a ti mismo.");
        }
        const target = await deps.users.findByIdOrThrow(targetUserId);
        if (target.isOwner) {
            const owners = await deps.users.countOwners();
            if (owners <= 1) {
                throw new HttpError(409, "No puedes desactivar al unico dueno del sistema.");
            }
        }
        return deps.users.deactivate(targetUserId);
    };
}
//# sourceMappingURL=deactivateAdmin.usecase.js.map