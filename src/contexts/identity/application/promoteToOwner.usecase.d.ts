import type { UserRepository } from "../domain/ports/UserRepository.js";
export declare function makePromoteToOwner(deps: {
    users: UserRepository;
}): (userId: number) => Promise<{
    id: number;
    name: string;
    email: string;
    isOwner: boolean;
}>;
//# sourceMappingURL=promoteToOwner.usecase.d.ts.map