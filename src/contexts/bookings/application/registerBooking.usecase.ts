import type { BookingRepository } from "../domain/ports/BookingRepository.js";
import type { CourtRepository } from "../domain/ports/CourtRepository.js";
import type { NotificationSender } from "../../notifications/application/ports/NotificationSender.js";
import { assertValidRange, hasConflict } from "../domain/model/Booking.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface RegisterBookingInput {
  courtId: number;
  customerId?: number;
  clienteNuevo?: { name: string; phone: string; documentNumber?: string };
  customerName: string;
  customerEmail?: string;
  type?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  totalAmount: number;
}

// TS01 (+ TS09, creacion de cliente embebida) — caso de uso de Aplicacion: orquesta el
// dominio (regla RF06 de no-doble-reserva) contra los puertos BookingRepository/CourtRepository,
// y dispara la notificacion (RF23/RF24) fuera de la transaccion, sin poder revertirla.
export function makeRegisterBooking(deps: {
  bookings: BookingRepository;
  courts: CourtRepository;
  notifier: NotificationSender;
}) {
  return async function registerBooking(input: RegisterBookingInput) {
    const date = new Date(input.date);
    const startTime = new Date(`1970-01-01T${input.startTime}:00Z`);
    const endTime = new Date(`1970-01-01T${input.endTime}:00Z`);

    try {
      assertValidRange({ startTime, endTime });
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    const booking = await deps.bookings.runTransaction(async (tx) => {
      const candidates = await tx.findActiveOverlapCandidates(input.courtId, date);
      if (hasConflict({ startTime, endTime }, candidates)) {
        // Equivalente a DoubleBookingRejected: se rechaza la operacion sin persistir nada.
        throw new HttpError(409, "Ya existe un alquiler activo para esa cancha en ese horario.");
      }
      if (await tx.isTimeBlocked(input.courtId, date, { startTime, endTime })) {
        throw new HttpError(409, "Esa franja esta bloqueada por mantenimiento.");
      }

      let customerId = input.customerId;
      // TS09 — si viene clienteNuevo en vez de customerId, se crea en la misma transaccion.
      if (!customerId && input.clienteNuevo) {
        const customer = await tx.createEmbeddedCustomer(input.clienteNuevo);
        customerId = customer.id;
      }

      return tx.create({
        courtId: input.courtId,
        customerId,
        customerName: input.customerName,
        type: input.type,
        date,
        startTime,
        endTime,
        totalAmount: input.totalAmount,
      });
    });

    // RF23/RF24 — la notificacion corre fuera de la transaccion y nunca revierte el alquiler.
    if (input.customerEmail) {
      const court = await deps.courts.findByIdOrThrow(input.courtId);
      void deps.notifier.sendBookingConfirmation({
        to: input.customerEmail,
        customerName: input.customerName,
        courtName: court.name,
        date: input.date,
        startTime: input.startTime,
        endTime: input.endTime,
      });
    }

    return booking;
  };
}
