import { Router } from "express";
import { requireAuth } from "../../../../platform/middlewares/auth.middleware.js";
import { userRepository } from "../../infrastructure/persistence/PrismaUserRepository.js";
import { sessionRepository } from "../../infrastructure/persistence/PrismaSessionRepository.js";
import { makeLogin } from "../../application/login.usecase.js";
import { makeLogout } from "../../application/logout.usecase.js";
import { makeBootstrapOwner } from "../../application/bootstrapOwner.usecase.js";

const login = makeLogin({ users: userRepository, sessions: sessionRepository });
const logout = makeLogout({ sessions: sessionRepository });
const bootstrapOwner = makeBootstrapOwner({ users: userRepository });

export const authRouter = Router();

// Arranque del sistema: crea al primer administrador dueno. Publico pero protegido por
// SETUP_TOKEN + el guard de "ya existe un owner" (ver bootstrapOwner.usecase.ts).
authRouter.post("/bootstrap-dueno", async (req, res, next) => {
  try {
    const owner = await bootstrapOwner(req.body);
    res.status(201).json(owner);
  } catch (err) {
    next(err);
  }
});

// TS02 — POST /auth/login
authRouter.post("/login", async (req, res, next) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const result = await login({
      usernameOrEmail,
      password,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout
authRouter.post("/logout", requireAuth, async (req, res, next) => {
  try {
    const token = req.headers.authorization!.slice("Bearer ".length);
    await logout(req.user!.userId, token);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
