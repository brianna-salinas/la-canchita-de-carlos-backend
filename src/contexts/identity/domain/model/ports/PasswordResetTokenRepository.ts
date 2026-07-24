export interface PasswordResetToken {
  id: number;
  userId: number;
  used: boolean;
  expiresAt: Date;
}

// Recuperacion de contrasena (RF ¿Olvidaste tu contrasena?) — mismo patron que
// EmailVerificationTokenRepository: token opaco entregado por correo, solo se
// guarda su hash en la base de datos.
export interface PasswordResetTokenRepository {
  create(data: { userId: number; tokenHash: string; expiresAt: Date }): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<PasswordResetToken | null>;
  markUsedAndUpdatePassword(tokenId: number, userId: number, passwordHash: string): Promise<void>;
}
