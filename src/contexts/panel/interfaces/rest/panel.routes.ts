import { Router } from "express";
import { requireAuth } from "../../../../platform/middlewares/auth.middleware.js";
import { panelRepository } from "../../infrastructure/persistence/repositories/PrismaPanelRepository.js";
import { makeGetBookingsToday } from "../../application/getBookingsToday.usecase.js";
import { makeGetIncomeToday } from "../../application/getIncomeToday.usecase.js";
import { makeGetPendingPaymentsToday } from "../../application/getPendingPaymentsToday.usecase.js";

const getBookingsToday = makeGetBookingsToday({ panel: panelRepository });
const getIncomeToday = makeGetIncomeToday({ panel: panelRepository });
const getPendingPaymentsToday = makeGetPendingPaymentsToday({ panel: panelRepository });

export const panelRouter = Router();
panelRouter.use(requireAuth);

panelRouter.get("/todays-bookings", async (req, res, next) => {
  try {
    const data = await getBookingsToday(req.query.date as string | undefined);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

panelRouter.get("/todays-revenue", async (req, res, next) => {
  try {
    const data = await getIncomeToday(req.query.date as string | undefined);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

panelRouter.get("/todays-pending-payments", async (req, res, next) => {
  try {
    const data = await getPendingPaymentsToday(req.query.date as string | undefined);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});
