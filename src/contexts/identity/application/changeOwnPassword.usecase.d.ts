import type { UserRepository } from "../domain/ports/UserRepository.js";
import type { SessionRepository } from "../domain/ports/SessionRepository.js";
export declare function makeChangeOwnPassword(deps: {
    users: UserRepository;
    sessions: SessionRepository;
}): (userId: number, currentPassword: string, newPassword: string) => Promise<{
    updated: boolean;
}>;
//# sourceMappingURL=changeOwnPassword.usecase.d.ts.map