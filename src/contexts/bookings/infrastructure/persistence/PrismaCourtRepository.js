import { prisma } from "../../../../db.js";
function toCourt(row) {
    return { ...row, pricePerHour: Number(row.pricePerHour) };
}
// Adaptador de salida: implementa CourtRepository contra Prisma/PostgreSQL.
export class PrismaCourtRepository {
    async findByName(name) {
        const row = await prisma.court.findFirst({ where: { name } });
        return row ? toCourt(row) : null;
    }
    async create(data) {
        const row = await prisma.court.create({ data });
        return toCourt(row);
    }
    async update(courtId, data) {
        const row = await prisma.court.update({ where: { id: courtId }, data });
        return toCourt(row);
    }
    async updatePrice(courtId, pricePerHour) {
        const row = await prisma.court.update({ where: { id: courtId }, data: { pricePerHour } });
        return toCourt(row);
    }
    // "Eliminar cancha" es un borrado real (no soft-delete): se apoya en
    // ON DELETE CASCADE (ver migracion 20260722180001_court_delete_cascade)
    // para que Postgres borre en cascada los bloqueos de horario, las
    // reservas y los pagos de esa cancha. Es irreversible.
    async delete(courtId) {
        await prisma.court.delete({ where: { id: courtId } });
    }
    async listAll() {
        const rows = await prisma.court.findMany({ orderBy: { name: "asc" } });
        return rows.map(toCourt);
    }
    async updatePhoto(courtId, photoUrl) {
        const row = await prisma.court.update({ where: { id: courtId }, data: { photoUrl } });
        return toCourt(row);
    }
    async getConsolidatedAvailability(date) {
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
        return rows.map((row) => ({ ...toCourt(row), bookings: row.bookings, scheduleBlocks: row.scheduleBlocks }));
    }
    async findByIdOrThrow(courtId) {
        const row = await prisma.court.findUniqueOrThrow({ where: { id: courtId } });
        return toCourt(row);
    }
}
export const courtRepository = new PrismaCourtRepository();
//# sourceMappingURL=PrismaCourtRepository.js.map