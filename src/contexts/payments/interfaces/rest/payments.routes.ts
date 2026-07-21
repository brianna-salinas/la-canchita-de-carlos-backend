import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../../../platform/middlewares/auth.middleware.js";
import { paymentRepository } from "../../infrastructure/persistence/PrismaPaymentRepository.js";
import { SupabaseFileStorage } from "../../../../platform/storage/SupabaseFileStorage.js";
import { makeRegisterPayment } from "../../application/registerPayment.usecase.js";
import { makeAttachReceipt } from "../../application/attachReceipt.usecase.js";

const upload = multer({ storage: multer.memoryStorage() });
const storage = new SupabaseFileStorage();

const registerPayment = makeRegisterPayment({ payments: paymentRepository });
const attachReceipt = makeAttachReceipt({ payments: paymentRepository, storage });

export const paymentsRouter = Router();
paymentsRouter.use(requireAuth);

// TS03 — POST /payments
paymentsRouter.post("/", async (req, res, next) => {
  try {
    const result = await registerPayment(req.body);
    res.status(201).json(result);
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
