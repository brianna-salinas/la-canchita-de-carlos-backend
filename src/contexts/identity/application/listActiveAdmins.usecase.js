// RF27 / US26 — listar administradores activos (no expone pendientes ni rechazados).
export function makeListActiveAdmins(deps) {
    return function listActiveAdmins() {
        return deps.users.listActiveAdmins();
    };
}
//# sourceMappingURL=listActiveAdmins.usecase.js.map