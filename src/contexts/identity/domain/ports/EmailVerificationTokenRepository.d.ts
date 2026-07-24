export interface EmailVerificationToken {
    id: number;
    userId: number;
    used: boolean;
    expiresAt: Date;
}
export interface EmailVerificationTokenRepository {
    create(data: {
        userId: number;
        tokenHash: string;
        expiresAt: Date;
    }): Promise<void>;
    findByTokenHash(tokenHash: string): Promise<EmailVerificationToken | null>;
    markUsedAndActivateUser(tokenId: number, userId: number): Promise<void>;
}
//# sourceMappingURL=EmailVerificationTokenRepository.d.ts.map