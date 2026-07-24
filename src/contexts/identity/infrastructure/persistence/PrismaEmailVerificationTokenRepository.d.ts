import type { EmailVerificationTokenRepository, EmailVerificationToken } from "../../domain/ports/EmailVerificationTokenRepository.js";
export declare class PrismaEmailVerificationTokenRepository implements EmailVerificationTokenRepository {
    create(data: {
        userId: number;
        tokenHash: string;
        expiresAt: Date;
    }): Promise<void>;
    findByTokenHash(tokenHash: string): Promise<EmailVerificationToken | null>;
    markUsedAndActivateUser(tokenId: number, userId: number): Promise<void>;
}
export declare const emailVerificationTokenRepository: EmailVerificationTokenRepository;
//# sourceMappingURL=PrismaEmailVerificationTokenRepository.d.ts.map