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

// US17 — GET /panel/alquileres-del-dia?fecha=
panelRouter.get("/alquileres-del-dia", async (req, res, next) => {
  try {
    const data = await getBookingsToday(req.query.fecha as string | undefined);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

// US18 — GET /panel/ingreso-del-dia?fecha=
panelRouter.get("/ingreso-del-dia", async (req, res, next) => {
  try {
    const data = await getIncomeToday(req.query.fecha as string | undefined);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});

// US19 — GET /panel/pendientes-del-dia?fecha=
panelRouter.get("/pendientes-del-dia", async (req, res, next) => {
  try {
    const data = await getPendingPaymentsToday(req.query.fecha as string | undefined);
    res.status(200).json(data);
  } catch (err) {
    next(err);
  }
});
