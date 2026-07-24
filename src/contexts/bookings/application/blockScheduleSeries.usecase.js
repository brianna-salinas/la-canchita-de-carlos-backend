import { assertValidBlockRange, hourlySlots } from "../domain/model/ScheduleBlock.js";
import { hasConflict, assertNotInPast } from "../domain/model/Booking.js";
import { HttpError } from "../../../platform/errors/HttpError.js";
// Igual que blockSchedule (RF07/RF32), pero para varias fechas de una sola
// vez ("programar mantenimiento recurrente": cada jueves, un dia al mes,
// etc.). El frontend calcula las fechas concretas de la serie, igual que ya
// hace para las reservas recurrentes (ver registerBookingSeries.usecase.ts).
// Ademas de crear los ScheduleBlock, avisa al resto de administradores
// activos (in-app, campanita) — antes esto no existia y la campanita nunca
// mostraba nada relacionado a mantenimiento.
export function makeBlockScheduleSeries(deps) {
    return async function blockScheduleSeries(input) {
        if (!input.dates || input.dates.length === 0) {
            throw new HttpError(400, "Selecciona al menos una fecha.");
        }
        const startTime = new Date(`1970-01-01T${input.startTime}:00Z`);
        const endTime = new Date(`1970-01-01T${input.endTime}:00Z`);
        const court = await deps.courts.findByIdOrThrow(input.courtId);
        try {
            assertValidBlockRange(startTime, endTime);
        }
        catch (e) {
            throw new HttpError(400, e.message);
        }
        // Se valida TODA la serie antes de crear nada, para no dejar bloqueos a
        // medias si una sola fecha de la serie tiene un alquiler activo en esa
        // franja, o si alguna fecha/hora ya paso (antes esto no se revisaba: se
        // podia "programar" un mantenimiento para una hora que ya paso).
        for (const dateStr of input.dates) {
            const date = new Date(dateStr);
            try {
                assertNotInPast(date, startTime);
            }
            catch (e) {
                throw new HttpError(400, `${e.message} (${dateStr})`);
            }
            const activeBookings = await deps.bookings.findActiveOverlapCandidates(input.courtId, date);
            if (hasConflict({ startTime, endTime }, activeBookings)) {
                throw new HttpError(409, `Ya existe un alquiler activo en esa franja el ${dateStr}; no se puede bloquear por mantenimiento.`);
            }
        }
        const slots = hourlySlots(startTime, endTime);
        const created = [];
        for (const dateStr of input.dates) {
            const date = new Date(dateStr);
            const blocks = await deps.scheduleBlocks.createMany(input.courtId, date, slots, input.reason);
            created.push(...blocks);
        }
        // Aviso entre administradores (in-app, campanita) — una sola notificacion
        // para toda la serie, no una por fecha/hora.
        const otherAdmins = await deps.admins.listOtherActiveAdmins(input.actorUserId);
        if (otherAdmins.length > 0) {
            const registeredByName = input.actorUserId ? await deps.admins.findAdminNameOrThrow(input.actorUserId) : "Un administrador";
            const total = input.dates.length;
            const dateLabel = total === 1 ? input.dates[0] : `${input.dates[0]} (+${total - 1} fecha(s) mas)`;
            void deps.notifications.createForUsers(otherAdmins.map((a) => a.id), {
                type: "COURT_MAINTENANCE",
                title: "Mantenimiento programado",
                message: `${registeredByName} bloqueo ${court.name} por mantenimiento el ${dateLabel}, de ${input.startTime} a ${input.endTime}.`,
            });
        }
        return created;
    };
}
//# sourceMappingURL=blockScheduleSeries.usecase.js.map