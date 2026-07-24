import type { UserRepository } from "../domain/ports/UserRepository.js";
import type { SessionRepository } from "../domain/ports/SessionRepository.js";
export declare function makeDeactivateOwnAccount(deps: {
    users: UserRepository;
    sessions: SessionRepository;
}): (userId: number) => Promise<{
    id: number;
    status: import("../domain/model/User.js").UserStatus;
}>;
//# sourceMappingURL=deactivateOwnAccount.usecase.d.ts.map