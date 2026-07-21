import { Router } from "express";
import { requireAuth } from "../../../../platform/middlewares/auth.middleware.js";
import { notificationRepository } from "../../infrastructure/persistence/PrismaNotificationRepository.js";
import { makeListMyNotifications } from "../../application/listMyNotifications.usecase.js";
import { makeMarkNotificationRead } from "../../application/markNotificationRead.usecase.js";

const listMyNotifications = makeListMyNotifications({ notifications: notificationRepository });
const markNotificationRead = makeMarkNotificationRead({ notifications: notificationRepository });

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

// GET /notifications — notificaciones in-app del admin logueado (ej. NEW_BOOKING).
notificationsRouter.get("/", async (req, res, next) => {
  try {
    const notifications = await listMyNotifications(req.user!.userId);
    res.status(200).json(notifications);
  } catch (err) {
    next(err);
  }
});

// PATCH /notifications/:id/leida
notificationsRouter.patch("/:id/leida", async (req, res, next) => {
  try {
    await markNotificationRead(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
