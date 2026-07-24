import type { ScheduleBlockRepository } from "../domain/model/ports/ScheduleBlockRepository.js";
import type { BookingRepository } from "../domain/model/ports/BookingRepository.js";
import { assertValidBlockRange, hourlySlots } from "../domain/model/aggregates/ScheduleBlock.js";
import { hasConflict, assertNotInPast } from "../domain/model/aggregates/Booking.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface BlockScheduleInput {
  courtId: number;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string;
}

export function makeBlockSchedule(deps: { scheduleBlocks: ScheduleBlockRepository; bookings: BookingRepository }) {
  return async function blockSchedule(input: BlockScheduleInput) {
    const date = new Date(input.date);
    const startTime = new Date(`1970-01-01T${input.startTime}:00Z`);
    const endTime = new Date(`1970-01-01T${input.endTime}:00Z`);

    try {
      assertValidBlockRange(startTime, endTime);

      assertNotInPast(date, startTime);
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    const activeBookings = await deps.bookings.findActiveOverlapCandidates(input.courtId, date);
    if (hasConflict({ startTime, endTime }, activeBookings)) {
      throw new HttpError(409, "Ya existe un alquiler activo en esa franja; no se puede bloquear por mantenimiento.");
    }

    const slots = hourlySlots(startTime, endTime);
    return deps.scheduleBlocks.createMany(input.courtId, date, slots, input.reason);
  };
}
