import type { UserRepository } from "../domain/ports/UserRepository.js";
export interface BootstrapOwnerInput {
    name: string;
    username: string;
    email: string;
    password: string;
    setupToken: string;
}
export declare function makeBootstrapOwner(deps: {
    users: UserRepository;
}): (input: BootstrapOwnerInput) => Promise<{
    id: number;
    username: string;
    email: string;
    isOwner: boolean;
}>;
//# sourceMappingURL=bootstrapOwner.usecase.d.ts.map