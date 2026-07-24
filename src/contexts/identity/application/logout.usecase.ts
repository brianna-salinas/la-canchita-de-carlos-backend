import type { SessionRepository } from "../domain/model/ports/SessionRepository.js";
import { hashToken } from "../../../platform/security/tokens.js";

export function makeLogout(deps: { sessions: SessionRepository }) {
  return function logout(userId: number, accessToken: string) {
    return deps.sessions.revoke(userId, hashToken(accessToken));
  };
}
