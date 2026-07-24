import type { SessionRepository } from "../domain/ports/SessionRepository.js";
export declare function makeLogout(deps: {
    sessions: SessionRepository;
}): (userId: number, accessToken: string) => Promise<void>;
//# sourceMappingURL=logout.usecase.d.ts.map