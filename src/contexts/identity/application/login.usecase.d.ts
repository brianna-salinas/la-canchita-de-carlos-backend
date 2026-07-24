import type { UserRepository } from "../domain/ports/UserRepository.js";
import type { SessionRepository } from "../domain/ports/SessionRepository.js";
export interface LoginInput {
    usernameOrEmail: string;
    password: string;
    ip?: string;
    userAgent?: string;
}
export declare function makeLogin(deps: {
    users: UserRepository;
    sessions: SessionRepository;
}): (input: LoginInput) => Promise<{
    accessToken: string;
    user: {
        id: number;
        name: string;
        username: string;
        email: string;
        isOwner: boolean;
        photoUrl: string | null;
    };
}>;
//# sourceMappingURL=login.usecase.d.ts.map