import { defineConfig } from "prisma/config";
import "dotenv/config";

// Migrate necesita la conexión DIRECTA (sin pgbouncer) para poder
// crear/alterar tablas. La conexión pooled (DATABASE_URL) se usa
// solo en el cliente de la app (src/db.ts), no aquí.
export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL ?? "",
  },
});