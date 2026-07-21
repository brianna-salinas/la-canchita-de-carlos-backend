import { randomUUID } from "crypto";
import type { BookingRepository } from "../domain/ports/BookingRepository.js";
import type { CourtRepository } from "../domain/ports/CourtRepository.js";
import type { NotificationSender } from "../../notifications/application/ports/NotificationSender.js";
import { assertValidRange, hasConflict } from "../domain/model/Booking.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface RegisterBookingSeriesInput {
  courtId: number;
  customerId?: number;
  clienteNuevo?: { name: string; phone: string; documentNumber?: string };
  customerName: string;
  customerEmail?: string;
  type?: string;
  dates: string[]; // YYYY-MM-DD, una por fecha de la serie (el frontend calcula la recurrencia)
  startTime: string; // HH:mm, igual para todas las fechas
  endTime: string; // HH:mm, igual para todas las fechas
  totalAmount: number; // interpretacion depende de seriesPaymentMode (ver abajo)
  seriesPaymentMode: "INDIVIDUAL" | "LUMP_SUM";
  seriesLabel?: string;
  bookingType?: "MULTIDAY" | "RECURRING"; // default RECURRING si hay mas de 1 fecha
}

// Reservas multidia/recurrentes (schema: bookingType/seriesId/seriesPaymentMode/etc.,
// ya soportado por el frontend). El backend generaba unicamente Booking SINGLE; este
// caso de uso crea N Booking en una misma transaccion, todos ligados por seriesId,
// revalidando RF06 (no-doble-reserva) fecha por fecha.
//
// Interpretacion de totalAmount segun seriesPaymentMode (a confirmar con el frontend):
// - INDIVIDUAL: totalAmount es el monto POR FECHA (se cobra cada dia por separado).
// - LUMP_SUM: totalAmount es el monto TOTAL de toda la serie, cargado al primer Booking
//   (el "ancla"); las demas fechas quedan con totalAmount 0 porque el pago se registra
//   una sola vez contra esa fecha ancla.
export function makeRegisterBookingSeries(deps: {
  bookings: BookingRepository;
  courts: CourtRepository;
  notifier: NotificationSender;
}) {
  return async function registerBookingSeries(input: RegisterBookingSeriesInput) {
    if (!input.dates || input.dates.length === 0) {
      throw new HttpError(400, "La serie debe tener al menos una fecha.");
    }

    const startTime = new Date(`1970-01-01T${input.startTime}:00Z`);
    const endTime = new Date(`1970-01-01T${input.endTime}:00Z`);
    try {
      assertValidRange({ startTime, endTime });
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    const seriesId = randomUUID();
    const total = input.dates.length;
    const bookingType = input.bookingType ?? (total > 1 ? "RECURRING" : "MULTIDAY");

    const bookings = await deps.bookings.runTransaction(async (tx) => {
      let customerId = input.customerId;
      if (!customerId && input.clienteNuevo) {
        const customer = await tx.createEmbeddedCustomer(input.clienteNuevo);
        customerId = customer.id;
      }

      const created = [];
      for (let i = 0; i < input.dates.length; i++) {
        const date = new Date(input.dates[i]);

        const candidates = await tx.findActiveOverlapCandidates(input.courtId, date);
        if (hasConflict({ startTime, endTime }, candidates)) {
          throw new HttpError(409, `Ya existe un alquiler activo para esa cancha el ${input.dates[i]}.`);
        }
        if (await tx.isTimeBlocked(input.courtId, date, { startTime, endTime })) {
          throw new HttpError(409, `Esa franja esta bloqueada por mantenimiento el ${input.dates[i]}.`);
        }

        const amountForThisDate = input.seriesPaymentMode === "LUMP_SUM" ? (i === 0 ? input.totalAmount : 0) : input.totalAmount;

        const booking = await tx.create({
          courtId: input.courtId,
          customerId,
          customerName: input.customerName,
          type: input.type,
          date,
          startTime,
          endTime,
          totalAmount: amountForThisDate,
          bookingType,
          seriesId,
          seriesPaymentMode: input.seriesPaymentMode,
          seriesLabel: input.seriesLabel,
          seriesTotalDates: total,
          seriesIndex: i + 1,
        });
        created.push(booking);
      }
      return created;
    });

    // RF23/RF24 — una sola notificacion resumen para toda la serie, fuera de la transaccion.
    if (input.customerEmail) {
      const court = await deps.courts.findByIdOrThrow(input.courtId);
      void deps.notifier.sendBookingConfirmation({
        to: input.customerEmail,
        customerName: input.customerName,
        courtName: court.name,
        date: `${input.dates[0]} (+${total - 1} fecha(s) mas)`,
        startTime: input.startTime,
        endTime: input.endTime,
      });
    }

    return bookings;
  };
}
