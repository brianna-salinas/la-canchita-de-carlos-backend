import type { BookingRepository } from "../domain/ports/BookingRepository.js";
import type { CourtRepository } from "../domain/ports/CourtRepository.js";
import { assertValidRange, assertNotInPast, assertWithinOperatingHours, hasConflict, resolvePaymentStatus } from "../domain/model/Booking.js";
import { assertCourtAvailableForBooking } from "../domain/model/Court.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface EditBookingInput {
  courtId?: number;
  customerName?: string;
  type?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  // Correccion directa de pago (ej. revertir un "Pagado" a "Parcial" al
  // editar). El flujo normal de "agregar un pago" sigue siendo POST
  // /payments (solo suma); esto permite corregir el monto/estado completo.
  totalAmount?: number;
  paidAmount?: number;
}

// US05 — editar un alquiler, revalidando disponibilidad si cambia cancha/horario.
export function makeEditBooking(deps: { bookings: BookingRepository; courts: CourtRepository }) {
  return async function editBooking(bookingId: number, input: EditBookingInput) {
    return deps.bookings.runTransaction(async (tx) => {
      const existing = await tx.findByIdOrThrow(bookingId);

      const courtId = input.courtId ?? existing.courtId;
      const date = input.date ? new Date(input.date) : existing.date;
      const startTime = input.startTime ? new Date(`1970-01-01T${input.startTime}:00Z`) : existing.startTime;
      const endTime = input.endTime ? new Date(`1970-01-01T${input.endTime}:00Z`) : existing.endTime;

      // Solo hace falta revisar el horario de atencion si la cancha y/o el
      // horario realmente cambiaron: si no se tocaron, la reserva ya estaba
      // validada cuando se creo.
      const cambioCanchaUHorario =
        input.courtId !== undefined || input.date !== undefined || input.startTime !== undefined || input.endTime !== undefined;
      const court = cambioCanchaUHorario ? await deps.courts.findByIdOrThrow(courtId) : null;

      try {
        assertValidRange({ startTime, endTime });
        // Solo se valida que no sea pasado si el usuario esta reprogramando
        // (cambiando fecha y/o hora). Si no toco esos campos, se permite
        // editar otros datos (cliente, tipo, etc.) de una reserva cuya
        // fecha original ya paso, sin bloquearla por eso.
        if (input.date !== undefined || input.startTime !== undefined) {
          assertNotInPast(date, startTime);
        }
        if (court) {
          assertCourtAvailableForBooking(court);
          assertWithinOperatingHours(court.openTime, court.closeTime, { startTime, endTime });
        }
      } catch (e) {
        throw new HttpError(400, (e as Error).message);
      }

      const candidates = await tx.findActiveOverlapCandidates(courtId, date);
      if (hasConflict({ startTime, endTime }, candidates, bookingId)) {
        throw new HttpError(409, "Ya existe un alquiler activo para esa cancha en ese horario.");
      }

      // Antes solo se podia "agregar" pago (POST /payments, que solo suma),
      // asi que no habia forma de corregir un monto/estado mal registrado ni
      // de revertir un "Pagado" a "Parcial" desde la edicion. Si el usuario
      // toco el total o el pagado, se recalcula el estado de pago aca mismo.
      let paidAmount: number | undefined;
      let paymentStatus: ReturnType<typeof resolvePaymentStatus> | undefined;
      if (input.totalAmount !== undefined || input.paidAmount !== undefined) {
        const totalAmount = input.totalAmount ?? existing.totalAmount;
        paidAmount = input.paidAmount ?? existing.paidAmount;

        if (totalAmount <= 0) {
          throw new HttpError(400, "El monto total debe ser mayor a cero.");
        }
        if (paidAmount < 0) {
          throw new HttpError(400, "El monto pagado no puede ser negativo.");
        }
        if (paidAmount > totalAmount) {
          throw new HttpError(400, "El monto pagado no puede exceder el monto total.");
        }
        paymentStatus = resolvePaymentStatus(totalAmount, paidAmount);
      }

      return tx.update(bookingId, {
        courtId,
        date,
        startTime,
        endTime,
        type: input.type,
        customerName: input.customerName,
        totalAmount: input.totalAmount,
        paidAmount,
        paymentStatus,
      });
    });
  };
}
