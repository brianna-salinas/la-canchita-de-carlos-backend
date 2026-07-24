export interface SessionRepository {
  create(data: { userId: number; tokenHash: string; ipAddress?: string; userAgent?: string; expiresAt: Date }): Promise<void>;
  revoke(userId: number, tokenHash: string): Promise<void>;
  revokeAllForUser(userId: number): Promise<void>;
}
