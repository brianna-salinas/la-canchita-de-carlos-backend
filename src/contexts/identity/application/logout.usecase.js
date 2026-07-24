import { hashToken } from "../../../platform/security/tokens.js";
// Cierra la sesion actual invalidandola (SessionClosed, US03).
export function makeLogout(deps) {
    return function logout(userId, accessToken) {
        return deps.sessions.revoke(userId, hashToken(accessToken));
    };
}
//# sourceMappingURL=logout.usecase.js.map