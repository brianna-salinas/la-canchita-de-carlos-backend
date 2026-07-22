import { Router } from "express";
import { requireAuth } from "../../../../platform/middlewares/auth.middleware.js";
import { bookingRepository } from "../../infrastructure/persistence/PrismaBookingRepository.js";
import { courtRepository } from "../../infrastructure/persistence/PrismaCourtRepository.js";
import { notificationSender } from "../../../notifications/infrastructure/ResendNotificationSender.js";
import { notificationRepository } from "../../../notifications/infrastructure/persistence/PrismaNotificationRepository.js";
import { adminDirectory } from "../../infrastructure/persistence/PrismaAdminDirectory.js";
import { makeRegisterBooking } from "../../application/registerBooking.usecase.js";
import { makeEditBooking } from "../../application/editBooking.usecase.js";
import { makeCancelBooking } from "../../application/cancelBooking.usecase.js";
import { makeSearchBookings } from "../../application/searchBookings.usecase.js";
import { makeRegisterBookingSeries } from "../../application/registerBookingSeries.usecase.js";
import type { BookingStatus } from "../../domain/model/Booking.js";

// Adaptador de entrada : traduce HTTP <-> casos de uso de Aplicacion.
const registerBooking = makeRegisterBooking({
  bookings: bookingRepository,
  courts: courtRepository,
  notifier: notificationSender,
  admins: adminDirectory,
  notifications: notificationRepository,
});
const editBooking = makeEditBooking({ bookings: bookingRepository });
const cancelBooking = makeCancelBooking({ bookings: bookingRepository });
const searchBookings = makeSearchBookings({ bookings: bookingRepository });
const registerBookingSeries = makeRegisterBookingSeries({
  bookings: bookingRepository,
  courts: courtRepository,
  notifier: notificationSender,
  admins: adminDirectory,
  notifications: notificationRepository,
});

export const bookingsRouter = Router();
bookingsRouter.use(requireAuth);

// TS01 (+ TS09) — POST /bookings
bookingsRouter.post("/", async (req, res, next) => {
  try {
    const booking = await registerBooking({ ...req.body, actorUserId: req.user!.userId });
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});

// Reservas multidia/recurrentes — POST /bookings/serie
bookingsRouter.post("/serie", async (req, res, next) => {
  try {
    const bookings = await registerBookingSeries({ ...req.body, actorUserId: req.user!.userId });
    res.status(201).json(bookings);
  } catch (err) {
    next(err);
  }
});

// US05 — PATCH /bookings/:id
bookingsRouter.patch("/:id", async (req, res, next) => {
  try {
    const booking = await editBooking(Number(req.params.id), req.body);
    res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
});

// US05 — POST /bookings/:id/cancelar
bookingsRouter.post("/:id/cancelar", async (req, res, next) => {
  try {
    const booking = await cancelBooking(Number(req.params.id));
    res.status(200).json(booking);
  } catch (err) {
    next(err);
  }
});

// US08 — GET /bookings?courtId=&customerId=&status=&from=&to=
bookingsRouter.get("/", async (req, res, next) => {
  try {
    const { courtId, customerId, status, from, to } = req.query;
    const bookings = await searchBookings({
      courtId: courtId ? Number(courtId) : undefined,
      customerId: customerId ? Number(customerId) : undefined,
      status: status as BookingStatus | undefined,
      from: from ? new Date(String(from)) : undefined,
      to: to ? new Date(String(to)) : undefined,
    });
    res.status(200).json(bookings);
  } catch (err) {
    next(err);
  }
});
