import { Router } from "express";
import { requireAuth } from "../../../../platform/middlewares/auth.middleware.js";
import { customerRepository } from "../../infrastructure/persistence/repositories/PrismaCustomerRepository.js";
import { makeRegisterCustomer } from "../../application/registerCustomer.usecase.js";
import { makeUpdateCustomer } from "../../application/updateCustomer.usecase.js";
import { makeDeactivateCustomer } from "../../application/deactivateCustomer.usecase.js";
import { makeGetCustomerHistory } from "../../application/getCustomerHistory.usecase.js";
import { makeListCustomers } from "../../application/listCustomers.usecase.js";

const registerCustomer = makeRegisterCustomer({ customers: customerRepository });
const updateCustomer = makeUpdateCustomer({ customers: customerRepository });
const deactivateCustomer = makeDeactivateCustomer({ customers: customerRepository });
const getCustomerHistory = makeGetCustomerHistory({ customers: customerRepository });
const listCustomers = makeListCustomers({ customers: customerRepository });

export const customersRouter = Router();
customersRouter.use(requireAuth);

customersRouter.get("/", async (req, res, next) => {
  try {
    const customers = await listCustomers(req.query.search as string | undefined);
    res.status(200).json(customers);
  } catch (err) {
    next(err);
  }
});

customersRouter.post("/", async (req, res, next) => {
  try {
    const customer = await registerCustomer(req.body);
    res.status(201).json(customer);
  } catch (err) {
    next(err);
  }
});

customersRouter.patch("/:id", async (req, res, next) => {
  try {
    const customer = await updateCustomer(Number(req.params.id), req.body);
    res.status(200).json(customer);
  } catch (err) {
    next(err);
  }
});

customersRouter.delete("/:id", async (req, res, next) => {
  try {
    await deactivateCustomer(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

customersRouter.get("/:id/history", async (req, res, next) => {
  try {
    const history = await getCustomerHistory(Number(req.params.id));
    res.status(200).json(history);
  } catch (err) {
    next(err);
  }
});
