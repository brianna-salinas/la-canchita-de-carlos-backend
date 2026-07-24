import type { ScheduleBlockRepository } from "../domain/model/ports/ScheduleBlockRepository.js";
import type { BookingRepository } from "../domain/model/ports/BookingRepository.js";
import type { CourtRepository } from "../domain/model/ports/CourtRepository.js";
import type { AdminDirectory } from "../domain/model/ports/AdminDirectory.js";
import type { NotificationRepository } from "../../notifications/domain/model/ports/NotificationRepository.js";
import { assertValidBlockRange, hourlySlots } from "../domain/model/aggregates/ScheduleBlock.js";
import { hasConflict, assertNotInPast } from "../domain/model/aggregates/Booking.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface BlockScheduleSeriesInput {
  courtId: number;
  dates: string[];
  startTime: string;
  endTime: string;
  reason?: string;
  actorUserId?: number;
}

export function makeBlockScheduleSeries(deps: {
  scheduleBlocks: ScheduleBlockRepository;
  bookings: BookingRepository;
  courts: CourtRepository;
  admins: AdminDirectory;
  notifications: NotificationRepository;
}) {
  return async function blockScheduleSeries(input: BlockScheduleSeriesInput) {
    if (!input.dates || input.dates.length === 0) {
      throw new HttpError(400, "Selecciona al menos una fecha.");
    }

    const startTime = new Date(`1970-01-01T${input.startTime}:00Z`);
    const endTime = new Date(`1970-01-01T${input.endTime}:00Z`);

    const court = await deps.courts.findByIdOrThrow(input.courtId);

    try {
      assertValidBlockRange(startTime, endTime);
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    for (const dateStr of input.dates) {
      const date = new Date(dateStr);
      try {
        assertNotInPast(date, startTime);
      } catch (e) {
        throw new HttpError(400, `${(e as Error).message} (${dateStr})`);
      }
      const activeBookings = await deps.bookings.findActiveOverlapCandidates(input.courtId, date);
      if (hasConflict({ startTime, endTime }, activeBookings)) {
        throw new HttpError(
          409,
          `Ya existe un alquiler activo en esa franja el ${dateStr}; no se puede bloquear por mantenimiento.`
        );
      }
    }

    const slots = hourlySlots(startTime, endTime);
    const created = [];
    for (const dateStr of input.dates) {
      const date = new Date(dateStr);
      const blocks = await deps.scheduleBlocks.createMany(input.courtId, date, slots, input.reason);
      created.push(...blocks);
    }

    const otherAdmins = await deps.admins.listOtherActiveAdmins(input.actorUserId);
    if (otherAdmins.length > 0) {
      const registeredByName = input.actorUserId ? await deps.admins.findAdminNameOrThrow(input.actorUserId) : "Un administrador";
      const total = input.dates.length;
      const dateLabel = total === 1 ? input.dates[0] : `${input.dates[0]} (+${total - 1} fecha(s) mas)`;
      void deps.notifications.createForUsers(
        otherAdmins.map((a) => a.id),
        {
          type: "COURT_MAINTENANCE",
          title: "Mantenimiento programado",
          message: `${registeredByName} bloqueo ${court.name} por mantenimiento el ${dateLabel}, de ${input.startTime} a ${input.endTime}.`,
        }
      );
    }

    return created;
  };
}
