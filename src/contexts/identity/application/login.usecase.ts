import type { UserRepository } from "../domain/model/ports/UserRepository.js";
import type { SessionRepository } from "../domain/model/ports/SessionRepository.js";
import { assertCanLogin } from "../domain/model/aggregates/User.js";
import { verifyPassword } from "../../../platform/security/password.js";
import { signAccessToken } from "../../../platform/security/jwt.js";
import { hashToken, tokenExpiryFromNow } from "../../../platform/security/tokens.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface LoginInput {
  usernameOrEmail: string;
  password: string;
  ip?: string;
  userAgent?: string;
}

export function makeLogin(deps: { users: UserRepository; sessions: SessionRepository }) {
  return async function login(input: LoginInput) {
    const usernameOrEmail = input.usernameOrEmail.trim();
    const user = await deps.users.findByUsernameOrEmail(usernameOrEmail);
    if (!user) {
      throw new HttpError(401, "Usuario o contraseña incorrectos.");
    }

    try {
      assertCanLogin(user);
    } catch (e) {
      throw new HttpError(401, (e as Error).message);
    }

    const validPassword = await verifyPassword(input.password, user.passwordHash);
    if (!validPassword) {
      throw new HttpError(401, "Usuario o contraseña incorrectos.");
    }

    const accessToken = signAccessToken({ userId: user.id, isOwner: user.isOwner });

    await deps.sessions.create({
      userId: user.id,
      tokenHash: hashToken(accessToken),
      ipAddress: input.ip,
      userAgent: input.userAgent,
      expiresAt: tokenExpiryFromNow(8),
    });

    await deps.users.updateLastAccess(user.id);

    return {
      accessToken,

      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        isOwner: user.isOwner,
        photoUrl: user.photoUrl ?? null,
      },
    };
  };
}
