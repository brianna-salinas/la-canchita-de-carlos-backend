import "dotenv/config";
import express from "express";
import cors from "cors";
import { healthRouter } from "./platform/interfaces/rest/health.routes.js";
import { authRouter } from "./contexts/identity/interfaces/rest/auth.routes.js";
import { usersRouter } from "./contexts/identity/interfaces/rest/users.routes.js";
import { bookingsRouter } from "./contexts/bookings/interfaces/rest/bookings.routes.js";
import { courtsRouter } from "./contexts/bookings/interfaces/rest/courts.routes.js";
import { customersRouter } from "./contexts/customers/interfaces/rest/customers.routes.js";
import { paymentsRouter } from "./contexts/payments/interfaces/rest/payments.routes.js";
import { panelRouter } from "./contexts/panel/interfaces/rest/panel.routes.js";
import { notificationsRouter } from "./contexts/notifications/interfaces/rest/notifications.routes.js";
import { errorMiddleware } from "./platform/middlewares/error.middleware.js";

const app = express();
const PORT = process.env.PORT ?? 3000;
const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({
    service: "La Canchita de Carlos — API",
    status: "ok",
    health: "/health",
  });
});

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/bookings", bookingsRouter);
app.use("/courts", courtsRouter);
app.use("/customers", customersRouter);
app.use("/payments", paymentsRouter);
app.use("/panel", panelRouter);
app.use("/users", usersRouter);
app.use("/notifications", notificationsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
