import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../../../platform/middlewares/auth.middleware.js";
import { paymentRepository } from "../../infrastructure/persistence/repositories/PrismaPaymentRepository.js";
import { SupabaseFileStorage } from "../../../../platform/storage/SupabaseFileStorage.js";
import { makeRegisterPayment } from "../../application/registerPayment.usecase.js";
import { makeAttachReceipt } from "../../application/attachReceipt.usecase.js";
import { makeListPaymentsForBooking } from "../../application/listPaymentsForBooking.usecase.js";
import { makeGetReceiptSignedUrl } from "../../application/getReceiptSignedUrl.usecase.js";
import { HttpError } from "../../../../platform/errors/HttpError.js";

const upload = multer({ storage: multer.memoryStorage() });
const storage = new SupabaseFileStorage();

const registerPayment = makeRegisterPayment({ payments: paymentRepository });
const attachReceipt = makeAttachReceipt({ payments: paymentRepository, storage });
const listPaymentsForBooking = makeListPaymentsForBooking({ payments: paymentRepository });
const getReceiptSignedUrl = makeGetReceiptSignedUrl({ payments: paymentRepository, storage });

const VALID_METHODS = ["EFECTIVO", "YAPE", "OTRO"];

export const paymentsRouter = Router();
paymentsRouter.use(requireAuth);

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

paymentsRouter.get("/:bookingId", async (req, res, next) => {
  try {
    const payments = await listPaymentsForBooking(Number(req.params.bookingId));
    res.status(200).json(payments);
  } catch (err) {
    next(err);
  }
});

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

paymentsRouter.get("/:bookingId/comprobante", async (req, res, next) => {
  try {
    const result = await getReceiptSignedUrl(Number(req.params.bookingId));
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});
