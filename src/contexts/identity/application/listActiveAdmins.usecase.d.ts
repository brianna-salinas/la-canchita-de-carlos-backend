import type { UserRepository } from "../domain/ports/UserRepository.js";
export declare function makeListActiveAdmins(deps: {
    users: UserRepository;
}): () => Promise<Pick<import("../domain/model/User.js").User, "email" | "id" | "isOwner" | "lastAccess" | "name" | "photoUrl">[]>;
//# sourceMappingURL=listActiveAdmins.usecase.d.ts.map