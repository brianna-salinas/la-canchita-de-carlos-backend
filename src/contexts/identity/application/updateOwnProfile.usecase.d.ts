import type { UserRepository } from "../domain/ports/UserRepository.js";
export interface UpdateOwnProfileInput {
    name?: string;
    username?: string;
}
export declare function makeUpdateOwnProfile(deps: {
    users: UserRepository;
}): (userId: number, input: UpdateOwnProfileInput) => Promise<{
    id: number;
    name: string;
    username: string;
}>;
//# sourceMappingURL=updateOwnProfile.usecase.d.ts.map