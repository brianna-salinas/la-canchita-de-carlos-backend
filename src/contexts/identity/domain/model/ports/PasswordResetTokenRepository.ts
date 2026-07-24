export interface PasswordResetToken {
  id: number;
  userId: number;
  used: boolean;
  expiresAt: Date;
}

export interface PasswordResetTokenRepository {
  create(data: { userId: number; tokenHash: string; expiresAt: Date }): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
  markUsedAndUpdatePassword(tokenId: number, userId: number, passwordHash: string): Promise<void>;
}
