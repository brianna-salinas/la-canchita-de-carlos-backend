// US21 — listado de solicitudes pendientes (panel de solicitudes de acceso, solo dueno).
export function makeListPendingRequests(deps) {
    return function listPendingRequests() {
        return deps.accessRequests.listPending();
    };
}
//# sourceMappingURL=listPendingRequests.usecase.js.map