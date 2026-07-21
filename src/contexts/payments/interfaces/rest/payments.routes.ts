import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../../../platform/middlewares/auth.middleware.js";
import { paymentRepository } from "../../infrastructure/persistence/PrismaPaymentRepository.js";
import { SupabaseFileStorage } from "../../../../platform/storage/SupabaseFileStorage.js";
import { makeRegisterPayment } from "../../application/registerPayment.usecase.js";
import { makeAttachReceipt } from "../../application/attachReceipt.usecase.js";
import { makeListPaymentsForBooking } from "../../application/listPaymentsForBooking.usecase.js";
import { HttpError } from "../../../../platform/errors/HttpError.js";

const upload = multer({ storage: multer.memoryStorage() });
const storage = new SupabaseFileStorage();

const registerPayment = makeRegisterPayment({ payments: paymentRepository });
const attachReceipt = makeAttachReceipt({ payments: paymentRepository, storage });
const listPaymentsForBooking = makeListPaymentsForBooking({ payments: paymentRepository });

const VALID_METHODS = ["EFECTIVO", "YAPE", "OTRO"];

export const paymentsRouter = Router();
paymentsRouter.use(requireAuth);

// TS03 / RF16 / US16 — POST /payments (exige un metodo valido: efectivo, Yape u otro).
paymentsRouter.post("/", async (req, res, next) => {
  try {
    if (!VALID_METHODS.includes(req.body.method)) {
      throw new HttpError(400, "Metodo de pago invalido. Usa EFECTIVO, YAPE u OTRO.");
    }
    const result = await registerPayment(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// US16 — GET /payments/:bookingId (historial de pagos de un alquiler, con su metodo).
paymentsRouter.get("/:bookingId", async (req, res, next) => {
  try {
    const payments = await listPaymentsForBooking(Number(req.params.bookingId));
    res.status(200).json(payments);
  } catch (err) {
    next(err);
  }
});

// TS08 — POST /payments/:bookingId/comprobante
paymentsRouter.post("/:bookingId/comprobante", upload.single("comprobante"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envio ningun comprobante." });
    }
    const booking = await attachReceipt(Number(req.params.bookingId), req.file);
    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
});
