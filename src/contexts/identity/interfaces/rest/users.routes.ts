import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../../../platform/middlewares/auth.middleware.js";
import { requireOwner } from "../../../../platform/middlewares/ownerOnly.middleware.js";
import { userRepository } from "../../infrastructure/persistence/PrismaUserRepository.js";
import { accessRequestRepository } from "../../infrastructure/persistence/PrismaAccessRequestRepository.js";
import { emailVerificationTokenRepository } from "../../infrastructure/persistence/PrismaEmailVerificationTokenRepository.js";
import { notificationSender } from "../../../notifications/infrastructure/ResendNotificationSender.js";
import { SupabaseFileStorage } from "../../../../platform/storage/SupabaseFileStorage.js";
import { makeRequestAdminRegistration } from "../../application/requestAdminRegistration.usecase.js";
import { makeAuthorizeAdminRequest } from "../../application/authorizeAdminRequest.usecase.js";
import { makeRejectAdminRequest } from "../../application/rejectAdminRequest.usecase.js";
import { makeVerifyEmail } from "../../application/verifyEmail.usecase.js";
import { makeListPendingRequests } from "../../application/listPendingRequests.usecase.js";
import { makeListActiveAdmins } from "../../application/listActiveAdmins.usecase.js";
import { makeUpdateOwnEmail } from "../../application/updateOwnEmail.usecase.js";
import { makeChangeOwnPassword } from "../../application/changeOwnPassword.usecase.js";
import { makePromoteToOwner } from "../../application/promoteToOwner.usecase.js";
import { makeUploadUserPhoto } from "../../application/uploadUserPhoto.usecase.js";
import { makeDeactivateAdmin } from "../../application/deactivateAdmin.usecase.js";
import { makeDeactivateOwnAccount } from "../../application/deactivateOwnAccount.usecase.js";
import { makeUpdateOwnProfile } from "../../application/updateOwnProfile.usecase.js";
import { sessionRepository } from "../../infrastructure/persistence/PrismaSessionRepository.js";
import { HttpError } from "../../../../platform/errors/HttpError.js";
import { withSignedPhotoUrl, withSignedPhotoUrls } from "../../../../platform/storage/photoUrl.helper.js";

const upload = multer({ storage: multer.memoryStorage() });
const storage = new SupabaseFileStorage();

// El repositorio devuelve la entidad User completa (incluye passwordHash);
// nunca debe salir tal cual por la API. Antes /:id/foto ya lo devolvia
// completo por error; se corrige aca de paso.
function sinPasswordHash<T extends { passwordHash?: string }>(user: T): Omit<T, "passwordHash"> {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

const requestAdminRegistration = makeRequestAdminRegistration({
  users: userRepository,
  accessRequests: accessRequestRepository,
  notifier: notificationSender,
});
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
const uploadUserPhoto = makeUploadUserPhoto({ users: userRepository, storage });
const deactivateAdmin = makeDeactivateAdmin({ users: userRepository });
const deactivateOwnAccount = makeDeactivateOwnAccount({ users: userRepository, sessions: sessionRepository });
const updateOwnProfile = makeUpdateOwnProfile({ users: userRepository });

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
    res.status(200).json(await withSignedPhotoUrls(storage, admins));
  } catch (err) {
    next(err);
  }
});

// GET /users/me — datos del usuario autenticado con signed URL fresca de su
// foto de perfil. Antes el frontend solo obtenia la foto una vez (en el login
// o al subirla) y la guardaba en localStorage; como la signed URL expira a la
// hora, la foto "desaparecia solita" del navbar aunque siguiera en el bucket.
// El frontend llama este endpoint periodicamente para renovarla antes de que
// venza.
usersRouter.get("/me", async (req, res, next) => {
  try {
    const me = await userRepository.findByIdOrThrow(req.user!.userId);
    res.status(200).json(await withSignedPhotoUrl(storage, sinPasswordHash(me)));
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

// US26-US30 — PATCH /users/me/perfil (nombre y/o usuario propios).
usersRouter.patch("/me/perfil", async (req, res, next) => {
  try {
    const result = await updateOwnProfile(req.user!.userId, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// US26-US30 — DELETE /users/me (el usuario elimina/desactiva su propia cuenta).
// Debe declararse antes de DELETE /:id para que "me" no se interprete como un id numerico.
usersRouter.delete("/me", async (req, res, next) => {
  try {
    const result = await deactivateOwnAccount(req.user!.userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// US26-US30 — DELETE /users/:id (un dueno desactiva la cuenta de otro administrador).
usersRouter.delete("/:id", requireOwner, async (req, res, next) => {
  try {
    const result = await deactivateAdmin(req.user!.userId, Number(req.params.id));
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// TS10 (analogo) — POST /users/:id/foto (foto de perfil, carpeta publica "perfiles").
// Solo el propio usuario o un dueno puede cambiar la foto de una cuenta.
usersRouter.post("/:id/foto", upload.single("foto"), async (req, res, next) => {
  try {
    const targetId = Number(req.params.id);
    if (targetId !== req.user!.userId && !req.user!.isOwner) {
      throw new HttpError(403, "Solo puedes cambiar tu propia foto de perfil.");
    }
    if (!req.file) {
      return res.status(400).json({ error: "No se envio ninguna imagen." });
    }
    const user = await uploadUserPhoto(targetId, req.file);
    res.status(200).json(await withSignedPhotoUrl(storage, sinPasswordHash(user)));
  } catch (err) {
    next(err);
  }
});
