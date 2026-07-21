import { Router } from "express";
import { prisma } from "../../../db.js";

export const healthRouter = Router();

// TS04 — verifica que el backend y la base de datos esten operativos (Render suspende
// el servicio por inactividad en planes gratuitos; en Starter no hay cold start, ver 4.7.2).
healthRouter.get("/", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: "ok", db: "connected" });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});
