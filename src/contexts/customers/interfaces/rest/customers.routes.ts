import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../../../../platform/middlewares/auth.middleware.js";
import { customerRepository } from "../../infrastructure/persistence/PrismaCustomerRepository.js";
import { SupabaseFileStorage } from "../../../../platform/storage/SupabaseFileStorage.js";
import { makeRegisterCustomer } from "../../application/registerCustomer.usecase.js";
import { makeUpdateCustomer } from "../../application/updateCustomer.usecase.js";
import { makeDeactivateCustomer } from "../../application/deactivateCustomer.usecase.js";
import { makeGetCustomerHistory } from "../../application/getCustomerHistory.usecase.js";
import { makeListCustomers } from "../../application/listCustomers.usecase.js";
import { makeUploadCustomerPhoto } from "../../application/uploadCustomerPhoto.usecase.js";

const upload = multer({ storage: multer.memoryStorage() });
const storage = new SupabaseFileStorage();

const registerCustomer = makeRegisterCustomer({ customers: customerRepository });
const updateCustomer = makeUpdateCustomer({ customers: customerRepository });
const deactivateCustomer = makeDeactivateCustomer({ customers: customerRepository });
const getCustomerHistory = makeGetCustomerHistory({ customers: customerRepository });
const listCustomers = makeListCustomers({ customers: customerRepository });
const uploadCustomerPhoto = makeUploadCustomerPhoto({ customers: customerRepository, storage });

export const customersRouter = Router();
customersRouter.use(requireAuth);

// US09 — GET /customers?search=
customersRouter.get("/", async (req, res, next) => {
  try {
    const customers = await listCustomers(req.query.search as string | undefined);
    res.status(200).json(customers);
  } catch (err) {
    next(err);
  }
});

// US09 — POST /customers
customersRouter.post("/", async (req, res, next) => {
  try {
    const customer = await registerCustomer(req.body);
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
});

// US09 — PATCH /customers/:id
customersRouter.patch("/:id", async (req, res, next) => {
  try {
    const customer = await updateCustomer(Number(req.params.id), req.body);
    res.status(200).json(customer);
  } catch (err) {
    next(err);
  }
});

// US09 — DELETE /customers/:id (soft-delete, marca INACTIVE)
customersRouter.delete("/:id", async (req, res, next) => {
  try {
    await deactivateCustomer(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// US10 — GET /customers/:id/historial
customersRouter.get("/:id/historial", async (req, res, next) => {
  try {
    const history = await getCustomerHistory(Number(req.params.id));
    res.status(200).json(history);
  } catch (err) {
    next(err);
  }
});

// TS10 — POST /customers/:id/foto (carpeta publica "clientes").
customersRouter.post("/:id/foto", upload.single("foto"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se envio ninguna imagen." });
    }
    const customer = await uploadCustomerPhoto(Number(req.params.id), req.file);
    res.status(200).json(customer);
  } catch (err) {
    next(err);
  }
});
