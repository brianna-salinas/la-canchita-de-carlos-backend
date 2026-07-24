import type { UserRepository } from "../domain/ports/UserRepository.js";
export declare function makeDeactivateAdmin(deps: {
    users: UserRepository;
}): (actingUserId: number, targetUserId: number) => Promise<import("../domain/model/User.js").User>;
//# sourceMappingURL=deactivateAdmin.usecase.d.ts.map