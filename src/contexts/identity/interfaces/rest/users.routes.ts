import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../../../platform/middlewares/auth.middleware.js";
import { requireOwner } from "../../../../platform/middlewares/ownerOnly.middleware.js";
import { userRepository } from "../../infrastructure/persistence/repositories/PrismaUserRepository.js";
import { accessRequestRepository } from "../../infrastructure/persistence/repositories/PrismaAccessRequestRepository.js";
import { emailVerificationTokenRepository } from "../../infrastructure/persistence/repositories/PrismaEmailVerificationTokenRepository.js";
import { notificationSender } from "../../../notifications/infrastructure/email/ResendNotificationSender.js";
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
import { makeRemoveUserPhoto } from "../../application/removeUserPhoto.usecase.js";
import { makeDeactivateAdmin } from "../../application/deactivateAdmin.usecase.js";
import { makeDeactivateOwnAccount } from "../../application/deactivateOwnAccount.usecase.js";
import { makeUpdateOwnProfile } from "../../application/updateOwnProfile.usecase.js";
import { sessionRepository } from "../../infrastructure/persistence/repositories/PrismaSessionRepository.js";
import { HttpError } from "../../../../platform/errors/HttpError.js";
import { withSignedPhotoUrl, withSignedPhotoUrls } from "../../../../platform/storage/photoUrl.helper.js";

const upload = multer({ storage: multer.memoryStorage() });
const storage = new SupabaseFileStorage();

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
const removeUserPhoto = makeRemoveUserPhoto({ users: userRepository });
const deactivateAdmin = makeDeactivateAdmin({ users: userRepository });
const deactivateOwnAccount = makeDeactivateOwnAccount({ users: userRepository, sessions: sessionRepository });
const updateOwnProfile = makeUpdateOwnProfile({ users: userRepository });

export const usersRouter = Router();

usersRouter.post("/solicitudes", async (req, res, next) => {
  try {
    const request = await requestAdminRegistration(req.body);
    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/verificar", async (req, res, next) => {
  try {
    const result = await verifyEmail(String(req.query.token));
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

usersRouter.use(requireAuth);

usersRouter.get("/solicitudes", requireOwner, async (_req, res, next) => {
  try {
    const requests = await listPendingRequests();
    res.status(200).json(requests);
  } catch (err) {
    next(err);
  }
});

usersRouter.patch("/solicitudes/:id/autorizar", requireOwner, async (req, res, next) => {
  try {
    const result = await authorizeAdminRequest(Number(req.params.id));
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

usersRouter.patch("/solicitudes/:id/rechazar", requireOwner, async (req, res, next) => {
  try {
    const result = await rejectAdminRequest(Number(req.params.id));
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

usersRouter.patch("/:id/promover-dueno", requireOwner, async (req, res, next) => {
  try {
    const result = await promoteToOwner(Number(req.params.id));
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/", async (_req, res, next) => {
  try {
    const admins = await listActiveAdmins();
    res.status(200).json(await withSignedPhotoUrls(storage, admins));
  } catch (err) {
    next(err);
  }
});

usersRouter.get("/me", async (req, res, next) => {
  try {
    const me = await userRepository.findByIdOrThrow(req.user!.userId);
    res.status(200).json(await withSignedPhotoUrl(storage, sinPasswordHash(me)));
  } catch (err) {
    next(err);
  }
});

usersRouter.patch("/me/correo", async (req, res, next) => {
  try {
    const result = await updateOwnEmail(req.user!.userId, req.body.email);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

usersRouter.patch("/me/contrasena", async (req, res, next) => {
  try {
    const result = await changeOwnPassword(req.user!.userId, req.body.currentPassword, req.body.newPassword);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

usersRouter.patch("/me/perfil", async (req, res, next) => {
  try {
    const result = await updateOwnProfile(req.user!.userId, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

usersRouter.delete("/me", async (req, res, next) => {
  try {
    const result = await deactivateOwnAccount(req.user!.userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

usersRouter.delete("/:id", requireOwner, async (req, res, next) => {
  try {
    const result = await deactivateAdmin(req.user!.userId, Number(req.params.id));
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

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

usersRouter.delete("/:id/foto", async (req, res, next) => {
  try {
    const targetId = Number(req.params.id);
    if (targetId !== req.user!.userId && !req.user!.isOwner) {
      throw new HttpError(403, "Solo puedes cambiar tu propia foto de perfil.");
    }
    const user = await removeUserPhoto(targetId);
    res.status(200).json(await withSignedPhotoUrl(storage, sinPasswordHash(user)));
  } catch (err) {
    next(err);
  }
});
