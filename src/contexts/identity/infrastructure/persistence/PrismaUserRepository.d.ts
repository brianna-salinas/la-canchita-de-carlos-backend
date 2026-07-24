import type { UserRepository, NewUserData } from "../../domain/ports/UserRepository.js";
import type { User } from "../../domain/model/User.js";
export declare class PrismaUserRepository implements UserRepository {
    findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByIdOrThrow(userId: number): Promise<User>;
    countOwners(): Promise<number>;
    create(data: NewUserData): Promise<User>;
    promoteToOwner(userId: number): Promise<User>;
    activate(userId: number): Promise<User>;
    deactivate(userId: number): Promise<User>;
    updateLastAccess(userId: number): Promise<void>;
    updateEmail(userId: number, email: string): Promise<User>;
    updatePasswordHash(userId: number, passwordHash: string): Promise<void>;
    updateProfile(userId: number, data: {
        name?: string;
        username?: string;
    }): Promise<User>;
    listActiveAdmins(): Promise<{
        email: string;
        id: number;
        isOwner: boolean;
        lastAccess: Date | null;
        name: string;
        photoUrl: string | null;
    }[]>;
    listOwnerEmails(): Promise<string[]>;
    updatePhoto(userId: number, photoUrl: string): Promise<User>;
}
export declare const userRepository: UserRepository;
//# sourceMappingURL=PrismaUserRepository.d.ts.map