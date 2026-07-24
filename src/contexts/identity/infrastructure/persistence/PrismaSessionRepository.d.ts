import type { SessionRepository } from "../../domain/ports/SessionRepository.js";
export declare class PrismaSessionRepository implements SessionRepository {
    create(data: {
        userId: number;
        tokenHash: string;
        ipAddress?: string;
        userAgent?: string;
        expiresAt: Date;
    }): Promise<void>;
    revoke(userId: number, tokenHash: string): Promise<void>;
    revokeAllForUser(userId: number): Promise<void>;
}
export declare const sessionRepository: SessionRepository;
//# sourceMappingURL=PrismaSessionRepository.d.ts.map