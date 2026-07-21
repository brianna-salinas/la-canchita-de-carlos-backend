import type { BookingRepository } from "../domain/ports/BookingRepository.js";
import { assertValidRange, hasConflict } from "../domain/model/Booking.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface EditBookingInput {
  courtId?: number;
  customerName?: string;
  type?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
}

// US05 — editar un alquiler, revalidando disponibilidad si cambia cancha/horario.
export function makeEditBooking(deps: { bookings: BookingRepository }) {
  return async function editBooking(bookingId: number, input: EditBookingInput) {
    return deps.bookings.runTransaction(async (tx) => {
      const existing = await tx.findByIdOrThrow(bookingId);

      const courtId = input.courtId ?? existing.courtId;
      const date = input.date ? new Date(input.date) : existing.date;
      const startTime = input.startTime ? new Date(`1970-01-01T${input.startTime}:00Z`) : existing.startTime;
      const endTime = input.endTime ? new Date(`1970-01-01T${input.endTime}:00Z`) : existing.endTime;

      try {
        assertValidRange({ startTime, endTime });
      } catch (e) {
        throw new HttpError(400, (e as Error).message);
      }

      const candidates = await tx.findActiveOverlapCandidates(courtId, date);
      if (hasConflict({ startTime, endTime }, candidates, bookingId)) {
        throw new HttpError(409, "Ya existe un alquiler activo para esa cancha en ese horario.");
      }

      return tx.update(bookingId, {
        courtId,
        date,
        startTime,
        endTime,
        type: input.type,
        customerName: input.customerName,
      });
    });
  };
}
