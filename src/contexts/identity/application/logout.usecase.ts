import type { SessionRepository } from "../domain/ports/SessionRepository.js";
import { hashToken } from "../../../platform/security/tokens.js";

// Cierra la sesion actual invalidandola (SessionClosed, US03).
export function makeLogout(deps: { sessions: SessionRepository }) {
  return function logout(userId: number, accessToken: string) {
    return deps.sessions.revoke(userId, hashToken(accessToken));
  };
}
