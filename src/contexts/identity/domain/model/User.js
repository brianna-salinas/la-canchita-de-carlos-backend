// RF20/TS02 — reglas puras de elegibilidad para iniciar sesion.
export function assertCanLogin(user) {
    if (user.status === "PENDING_VERIFICATION") {
        throw new Error("Tu cuenta aun no fue verificada. Revisa tu correo para activarla (RF34).");
    }
    if (user.status === "INACTIVE") {
        throw new Error("Esta cuenta esta inactiva.");
    }
}
export function usernameFromEmail(email) {
    return email.split("@")[0] ?? email;
}
//# sourceMappingURL=User.js.map