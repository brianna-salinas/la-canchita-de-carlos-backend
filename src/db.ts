import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

// Usa la conexión pooled (DATABASE_URL) para servir queries en runtime.
// La conexión directa (DIRECT_URL) solo la usa Prisma Migrate.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });