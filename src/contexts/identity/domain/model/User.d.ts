export type UserStatus = "PENDING_VERIFICATION" | "ACTIVE" | "INACTIVE";
export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    passwordHash: string;
    status: UserStatus;
    isOwner: boolean;
    lastAccess?: Date | null;
    photoUrl?: string | null;
}
export declare function assertCanLogin(user: Pick<User, "status">): void;
export declare function usernameFromEmail(email: string): string;
//# sourceMappingURL=User.d.ts.map