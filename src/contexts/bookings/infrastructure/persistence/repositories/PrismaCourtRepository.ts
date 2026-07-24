import { prisma } from "../../../../../db.js";
import type { CourtRepository, NewCourtData, UpdateCourtData, CourtAvailability } from "../../../domain/model/ports/CourtRepository.js";
import type { Court } from "../../../domain/model/aggregates/Court.js";

function toCourt(row: any): Court {
  return { ...row, pricePerHour: Number(row.pricePerHour) };
}

// Adaptador de salida: implementa CourtRepository contra Prisma/PostgreSQL.
export class PrismaCourtRepository implements CourtRepository {
  async findByName(name: string): Promise<Court | null> {
    const row = await prisma.court.findFirst({ where: { name } });
    return row ? toCourt(row) : null;
  }

  async create(data: NewCourtData): Promise<Court> {
    const row = await prisma.court.create({ data });
    return toCourt(row);
  }

  async update(courtId: number, data: UpdateCourtData): Promise<Court> {
    const row = await prisma.court.update({ where: { id: courtId }, data });
    return toCourt(row);
  }

  async updatePrice(courtId: number, pricePerHour: number): Promise<Court> {
    const row = await prisma.court.update({ where: { id: courtId }, data: { pricePerHour } });
    return toCourt(row);
  }

  // "Eliminar cancha" es un borrado real (no soft-delete): se apoya en
  // ON DELETE CASCADE (ver migracion 20260722180001_court_delete_cascade)
  // para que Postgres borre en cascada los bloqueos de horario, las
  // reservas y los pagos de esa cancha. Es irreversible.
  async delete(courtId: number): Promise<void> {
    await prisma.court.delete({ where: { id: courtId } });
  }

  async listAll(): Promise<Court[]> {
    const rows = await prisma.court.findMany({ orderBy: { name: "asc" } });
    return rows.map(toCourt);
  }

  async updatePhoto(courtId: number, photoUrl: string): Promise<Court> {
    const row = await prisma.court.update({ where: { id: courtId }, data: { photoUrl } });
    return toCourt(row);
  }

  async getConsolidatedAvailability(date: Date): Promise<CourtAvailability[]> {
    const rows = await prisma.court.findMany({
      // Bug: no filtraba por enabled, asi que "eliminar" una cancha (soft-
      // delete: enabled=false) no la sacaba de ningun lado — seguia
      // apareciendo en Canchas, Calendario y el selector de Nueva Reserva
      // como si nada hubiera pasado. Tampoco filtraba por status: una
      // cancha marcada "En mantenimiento" (estado operativo, distinto de
      // los bloqueos por hora) seguia apareciendo como disponible ahi
      // mismo — esta consulta es la que alimenta el selector de canchas
      // de Nueva Reserva y el Calendario, asi que tiene que reflejar los dos.
      where: { enabled: true, status: "ACTIVE" },
      include: {
        bookings: { where: { date, status: "BOOKED" } },
        scheduleBlocks: { where: { date } },
      },
    });
    // Bug: esta consulta devolvia las filas crudas de Prisma sin pasar por
    // toCourt(), asi que pricePerHour llegaba como Decimal (serializado como
    // string en el JSON) en vez de number, rompiendo al frontend en
    // cualquier pantalla que hiciera pricePerHour.toFixed(...).
    return rows.map((row) => ({ ...toCourt(row), bookings: row.bookings, scheduleBlocks: row.scheduleBlocks })) as unknown as CourtAvailability[];
  }

  async findByIdOrThrow(courtId: number): Promise<Court> {
    const row = await prisma.court.findUniqueOrThrow({ where: { id: courtId } });
    return toCourt(row);
  }
}

export const courtRepository: CourtRepository = new PrismaCourtRepository();
