import { Router } from "express";
import { requireAuth } from "../../../../platform/middlewares/auth.middleware.js";
import { requireOwner } from "../../../../platform/middlewares/ownerOnly.middleware.js";
import { userRepository } from "../../infrastructure/persistence/PrismaUserRepository.js";
import { accessRequestRepository } from "../../infrastructure/persistence/PrismaAccessRequestRepository.js";
import { emailVerificationTokenRepository } from "../../infrastructure/persistence/PrismaEmailVerificationTokenRepository.js";
import { notificationSender } from "../../../notifications/infrastructure/ResendNotificationSender.js";
import { makeRequestAdminRegistration } from "../../application/requestAdminRegistration.usecase.js";
import { makeAuthorizeAdminRequest } from "../../application/authorizeAdminRequest.usecase.js";
import { makeRejectAdminRequest } from "../../application/rejectAdminRequest.usecase.js";
import { makeVerifyEmail } from "../../application/verifyEmail.usecase.js";
import { makeListPendingRequests } from "../../application/listPendingRequests.usecase.js";
import { makeListActiveAdmins } from "../../application/listActiveAdmins.usecase.js";
import { makeUpdateOwnEmail } from "../../application/updateOwnEmail.usecase.js";
import { makeChangeOwnPassword } from "../../application/changeOwnPassword.usecase.js";
import { makePromoteToOwner } from "../../application/promoteToOwner.usecase.js";
import { sessionRepository } from "../../infrastructure/persistence/PrismaSessionRepository.js";

const requestAdminRegistration = makeRequestAdminRegistration({ users: userRepository, accessRequests: accessRequestRepository });
const authorizeAdminRequest = makeAuthorizeAdminRequest({
  users: userRepository,
  accessRequests: accessRequestRepository,
  emailVerificationTokens: emailVerificationTokenRepository,
  notifier: notificationSender,
});
const rejectAdminRequest = makeRejectAdminRequest({ accessRequests: accessRequestRepository, notifier: notificationSender });
const verifyEmail = makeVerifyEmail({ emailVerificationTokens: emailVerificationTokenRepository });
const listPendingRequests = makeListPendingRequests({ accessRequests: accessRequestRepository });
const listActiveAdmins = makeListActiveAdmins({ users: userRepository });
const updateOwnEmail = makeUpdateOwnEmail({ users: userRepository });
const changeOwnPassword = makeChangeOwnPassword({ users: userRepository, sessions: sessionRepository });
const promoteToOwner = makePromoteToOwner({ users: userRepository });

export const usersRouter = Router();

// TS05 / US20 — POST /users/solicitudes (publico, sin sesion — quien solicita aun no tiene cuenta).
usersRouter.post("/solicitudes", async (req, res, next) => {
  try {
    const request = await requestAdminRegistration(req.body);
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
});

// TS11 / US34 — GET /users/verificar?token=... (publico — quien verifica aun no puede iniciar sesion).
usersRouter.get("/verificar", async (req, res, next) => {
  try {
    const result = await verifyEmail(String(req.query.token));
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// A partir de aqui, todo requiere sesion iniciada.
usersRouter.use(requireAuth);

// US21 — GET /users/solicitudes (listado de pendientes, solo dueno).
usersRouter.get("/solicitudes", requireOwner, async (_req, res, next) => {
  try {
    const requests = await listPendingRequests();
    res.status(200).json(requests);
  } catch (err) {
    next(err);
  }
});

// TS05 / US21 — PATCH /users/solicitudes/:id/autorizar (solo dueno).
usersRouter.patch("/solicitudes/:id/autorizar", requireOwner, async (req, res, next) => {
  try {
    const result = await authorizeAdminRequest(Number(req.params.id));
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// TS05 / US21 — PATCH /users/solicitudes/:id/rechazar (solo dueno).
usersRouter.patch("/solicitudes/:id/rechazar", requireOwner, async (req, res, next) => {
  try {
    const result = await rejectAdminRequest(Number(req.params.id));
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// Owner es un rol, no un singleton: cualquier owner puede ascender a otro admin activo.
usersRouter.patch("/:id/promover-dueno", requireOwner, async (req, res, next) => {
  try {
    const result = await promoteToOwner(Number(req.params.id));
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// RF27 / US26 — GET /users?estado=ACTIVO
usersRouter.get("/", async (_req, res, next) => {
  try {
    const admins = await listActiveAdmins();
    res.status(200).json(admins);
  } catch (err) {
    next(err);
  }
});

// TS07 / US24 — PATCH /users/me/correo
usersRouter.patch("/me/correo", async (req, res, next) => {
  try {
    const result = await updateOwnEmail(req.user!.userId, req.body.email);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// TS07 / US25 — PATCH /users/me/contrasena
usersRouter.patch("/me/contrasena", async (req, res, next) => {
  try {
    const result = await changeOwnPassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});
