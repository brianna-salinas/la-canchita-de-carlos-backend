// Restringe autorizar/rechazar solicitudes de acceso al administrador dueno (RF21).
// Debe usarse siempre despues de requireAuth.
export function requireOwner(req, res, next) {
    if (!req.user?.isOwner) {
        return res.status(403).json({ error: "Solo el administrador dueno puede realizar esta accion." });
    }
    next();
}
//# sourceMappingURL=ownerOnly.middleware.js.map