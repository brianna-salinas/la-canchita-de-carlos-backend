import { Router } from "express";
import { requireAuth } from "../../../../platform/middlewares/auth.middleware.js";
import { userRepository } from "../../infrastructure/persistence/repositories/PrismaUserRepository.js";
import { sessionRepository } from "../../infrastructure/persistence/repositories/PrismaSessionRepository.js";
import { passwordResetTokenRepository } from "../../infrastructure/persistence/repositories/PrismaPasswordResetTokenRepository.js";
import { notificationSender } from "../../../notifications/infrastructure/email/ResendNotificationSender.js";
import { makeLogin } from "../../application/login.usecase.js";
import { makeLogout } from "../../application/logout.usecase.js";
import { makeBootstrapOwner } from "../../application/bootstrapOwner.usecase.js";
import { makeRequestPasswordReset } from "../../application/requestPasswordReset.usecase.js";
import { makeResetPassword } from "../../application/resetPassword.usecase.js";
import { SupabaseFileStorage } from "../../../../platform/storage/SupabaseFileStorage.js";
import { withSignedPhotoUrl } from "../../../../platform/storage/photoUrl.helper.js";

const storage = new SupabaseFileStorage();
const login = makeLogin({ users: userRepository, sessions: sessionRepository });
const logout = makeLogout({ sessions: sessionRepository });
const bootstrapOwner = makeBootstrapOwner({ users: userRepository });
const requestPasswordReset = makeRequestPasswordReset({
  users: userRepository,
  passwordResetTokens: passwordResetTokenRepository,
  notifier: notificationSender,
});
const resetPassword = makeResetPassword({
  passwordResetTokens: passwordResetTokenRepository,
  sessions: sessionRepository,
});

export const authRouter = Router();

authRouter.post("/bootstrap-dueno", async (req, res, next) => {
  try {
    const owner = await bootstrapOwner(req.body);
    res.status(201).json(owner);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const result = await login({
      usernameOrEmail,
      password,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.status(200).json({ ...result, user: await withSignedPhotoUrl(storage, result.user) });
  } catch (err) {
    next(err);
  }
});

authRouter.post("/olvide-password", async (req, res, next) => {
  try {
    const result = await requestPasswordReset(req.body.email);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/restablecer-password", async (req, res, next) => {
  try {
    const result = await resetPassword(req.body.token, req.body.newPassword);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

authRouter.post("/logout", requireAuth, async (req, res, next) => {
  try {
    const token = req.headers.authorization!.slice("Bearer ".length);
    await logout(req.user!.userId, token);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
