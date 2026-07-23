import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../../../platform/middlewares/auth.middleware.js";
import { courtRepository } from "../../infrastructure/persistence/PrismaCourtRepository.js";
import { SupabaseFileStorage } from "../../../../platform/storage/SupabaseFileStorage.js";
import { makeRegisterCourt } from "../../application/registerCourt.usecase.js";
import { makeUpdateCourt } from "../../application/updateCourt.usecase.js";
import { makeDeleteCourt } from "../../application/deleteCourt.usecase.js";
import { makeListCourts } from "../../application/listCourts.usecase.js";
import { makeUpdateCourtPrice } from "../../application/updateCourtPrice.usecase.js";
import { makeGetConsolidatedAvailability } from "../../application/getConsolidatedAvailability.usecase.js";
import { makeAddCourtPhoto } from "../../application/addCourtPhoto.usecase.js";
import { makeBlockSchedule } from "../../application/blockSchedule.usecase.js";
import { makeBlockScheduleSeries } from "../../application/blockScheduleSeries.usecase.js";
import { makeListScheduleBlocks } from "../../application/listScheduleBlocks.usecase.js";
import { makeListUpcomingScheduleBlocks } from "../../application/listUpcomingScheduleBlocks.usecase.js";
import { makeUnblockSchedule } from "../../application/unblockSchedule.usecase.js";
import { scheduleBlockRepository } from "../../infrastructure/persistence/PrismaScheduleBlockRepository.js";
import { bookingRepository } from "../../infrastructure/persistence/PrismaBookingRepository.js";
import { adminDirectory } from "../../infrastructure/persistence/PrismaAdminDirectory.js";
import { notificationRepository } from "../../../notifications/infrastructure/persistence/PrismaNotificationRepository.js";
import { withSignedPhotoUrl, withSignedPhotoUrls } from "../../../../platform/storage/photoUrl.helper.js";

const upload = multer({ storage: multer.memoryStorage() });
const storage = new SupabaseFileStorage();

const registerCourt = makeRegisterCourt({ courts: courtRepository });
const updateCourt = makeUpdateCourt({ courts: courtRepository });
const deleteCourt = makeDeleteCourt({ courts: courtRepository });
const listCourts = makeListCourts({ courts: courtRepository });
const updateCourtPrice = makeUpdateCourtPrice({ courts: courtRepository });
const getConsolidatedAvailability = makeGetConsolidatedAvailability({ courts: courtRepository });
const addCourtPhoto = makeAddCourtPhoto({ courts: courtRepository, storage });
const blockSchedule = makeBlockSchedule({ scheduleBlocks: scheduleBlockRepository, bookings: bookingRepository });
const blockScheduleSeries = makeBlockScheduleSeries({
  scheduleBlocks: scheduleBlockRepository,
  bookings: bookingRepository,
  courts: courtRepository,
  admins: adminDirectory,
  notifications: notificationRepository,
});
const listScheduleBlocks = makeListScheduleBlocks({ scheduleBlocks: scheduleBlockRepository });
const listUpcomingScheduleBlocks = makeListUpcomingScheduleBlocks({ scheduleBlocks: scheduleBlockRepository });
const unblockSchedule = makeUnblockSchedule({ scheduleBlocks: scheduleBlockRepository });

export const courtsRouter = Router();
courtsRouter.use(requireAuth);

// US11 — POST /courts
courtsRouter.post("/", async (req, res, next) => {
  try {
    const court = await registerCourt(req.body);
    res.status(201).json(await withSignedPhotoUrl(storage, court));
  } catch (err) {
    next(err);
  }
});

// US26-US30 — PATCH /courts/:id (nombre, deporte, superficie, descripcion, estado).
courtsRouter.patch("/:id", async (req, res, next) => {
  try {
    const court = await updateCourt(Number(req.params.id), req.body);
    res.status(200).json(await withSignedPhotoUrl(storage, court));
  } catch (err) {
    next(err);
  }
});

// US26-US30 — DELETE /courts/:id: borrado real e irreversible. Borra la
// cancha y, en cascada (a nivel de base de datos), sus bloqueos de
// horario, sus reservas y los pagos de esas reservas.
courtsRouter.delete("/:id", async (req, res, next) => {
  try {
    await deleteCourt(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// GET /courts (listado completo para administracion, incluye pausadas
// (enabled=false); para disponibilidad/reservas usar
// GET /courts/disponibilidad, que solo trae las habilitadas).
courtsRouter.get("/", async (_req, res, next) => {
  try {
    const courts = await listCourts();
    res.status(200).json(await withSignedPhotoUrls(storage, courts));
  } catch (err) {
    next(err);
  }
});

// US12 — PATCH /courts/:id/precio
courtsRouter.patch("/:id/precio", async (req, res, next) => {
  try {
    const court = await updateCourtPrice(Number(req.params.id), req.body.pricePerHour);
    res.status(200).json(await withSignedPhotoUrl(storage, court));
  } catch (err) {
    next(err);
  }
});

// US13 — GET /courts/disponibilidad?fecha=YYYY-MM-DD
courtsRouter.get("/disponibilidad", async (req, res, next) => {
  try {
    const courts = await getConsolidatedAvailability(String(req.query.fecha));
    res.status(200).json(await withSignedPhotoUrls(storage, courts));
  } catch (err) {
    next(err);
  }
});

// RF07/RF32/US07/US31 — POST /courts/:id/bloqueos (bloquear franja por mantenimiento).
courtsRouter.post("/:id/bloqueos", async (req, res, next) => {
  try {
    const blocks = await blockSchedule({ ...req.body, courtId: Number(req.params.id) });
    res.status(201).json(blocks);
  } catch (err) {
    next(err);
  }
});

// Mantenimiento recurrente ("cada jueves", "un dia al mes", etc.) — el
// frontend calcula las fechas concretas y las manda todas juntas, igual que
// ya hace /bookings/serie para reservas recurrentes.
courtsRouter.post("/:id/bloqueos/serie", async (req, res, next) => {
  try {
    const blocks = await blockScheduleSeries({ ...req.body, courtId: Number(req.params.id), actorUserId: req.user!.userId });
    res.status(201).json(blocks);
  } catch (err) {
    next(err);
  }
});

// GET /courts/:id/bloqueos/proximos — mantenimientos programados desde hoy
// en adelante (para poder verlos/cancelarlos desde Canchas). Debe declararse
// antes de GET /:id/bloqueos para que "proximos" no se intente leer como
// parte de la query de esa ruta.
courtsRouter.get("/:id/bloqueos/proximos", async (req, res, next) => {
  try {
    const blocks = await listUpcomingScheduleBlocks(Number(req.params.id));
    res.status(200).json(blocks);
  } catch (err) {
    next(err);
  }
});

// RF32/US31 — GET /courts/:id/bloqueos?fecha=YYYY-MM-DD
courtsRouter.get("/:id/bloqueos", async (req, res, next) => {
  try {
    const blocks = await listScheduleBlocks(Number(req.params.id), String(req.query.fecha));
    res.status(200).json(blocks);
  } catch (err) {
    next(err);
  }
});

// RF07 — DELETE /courts/bloqueos/:blockId (liberar un bloqueo antes de tiempo).
courtsRouter.delete("/bloqueos/:blockId", async (req, res, next) => {
  try {
    await unblockSchedule(Number(req.params.blockId));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// TS10 — POST /courts/:id/fotos
courtsRouter.post("/:id/fotos", upload.single("foto"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envio ninguna imagen." });
    }
    const court = await addCourtPhoto(Number(req.params.id), req.file);
    res.status(201).json(await withSignedPhotoUrl(storage, court));
  } catch (err) {
    next(err);
  }
});
