import { assertValidBlockRange, hourlySlots } from "../domain/model/ScheduleBlock.js";
import { hasConflict, assertNotInPast } from "../domain/model/Booking.js";
import { HttpError } from "../../../platform/errors/HttpError.js";
// RF07/RF32/US07/US31 — bloquea manualmente una o mas franjas horarias de una cancha
// por mantenimiento, con motivo opcional. Rechaza el bloqueo si ya hay un alquiler
// activo en esa franja (evita dejar el sistema en un estado contradictorio).
export function makeBlockSchedule(deps) {
    return async function blockSchedule(input) {
        const date = new Date(input.date);
        const startTime = new Date(`1970-01-01T${input.startTime}:00Z`);
        const endTime = new Date(`1970-01-01T${input.endTime}:00Z`);
        try {
            assertValidBlockRange(startTime, endTime);
            // Antes se podia bloquear por "mantenimiento" una franja que ya paso
            // (ej. bloquear 11-13h estando ya a las 14h); no tiene sentido y
            // ademas era inconsistente con las reservas, que si validan esto.
            assertNotInPast(date, startTime);
        }
        catch (e) {
            throw new HttpError(400, e.message);
        }
        const activeBookings = await deps.bookings.findActiveOverlapCandidates(input.courtId, date);
        if (hasConflict({ startTime, endTime }, activeBookings)) {
            throw new HttpError(409, "Ya existe un alquiler activo en esa franja; no se puede bloquear por mantenimiento.");
        }
        const slots = hourlySlots(startTime, endTime);
        return deps.scheduleBlocks.createMany(input.courtId, date, slots, input.reason);
    };
}
//# sourceMappingURL=blockSchedule.usecase.js.map