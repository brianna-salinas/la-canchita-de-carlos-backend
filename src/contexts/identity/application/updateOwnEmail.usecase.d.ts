import type { UserRepository } from "../domain/ports/UserRepository.js";
export declare function makeUpdateOwnEmail(deps: {
    users: UserRepository;
}): (userId: number, newEmail: string) => Promise<{
    id: number;
    email: string;
}>;
//# sourceMappingURL=updateOwnEmail.usecase.d.ts.map