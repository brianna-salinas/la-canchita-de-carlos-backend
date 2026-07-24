import { randomUUID } from "crypto";
import type { BookingRepository } from "../domain/model/ports/BookingRepository.js";
import type { CourtRepository } from "../domain/model/ports/CourtRepository.js";
import type { AdminDirectory } from "../domain/model/ports/AdminDirectory.js";
import type { NotificationSender } from "../../notifications/application/ports/NotificationSender.js";
import type { NotificationRepository } from "../../notifications/domain/model/ports/NotificationRepository.js";
import { assertValidRange, assertNotInPast, assertWithinOperatingHours, hasConflict } from "../domain/model/aggregates/Booking.js";
import { assertCourtAvailableForBooking } from "../domain/model/aggregates/Court.js";
import { assertNonEmpty, assertPositiveAmount, normalizeText } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface RegisterBookingSeriesInput {
  courtId: number;
  customerId?: number;
  clienteNuevo?: { name: string; phone: string; documentNumber?: string };
  customerName: string;
  customerEmail?: string;
  type?: string;
  dates: string[];
  startTime: string;
  endTime: string;
  totalAmount: number;
  seriesPaymentMode: "INDIVIDUAL" | "LUMP_SUM";
  seriesLabel?: string;
  bookingType?: "MULTIDAY" | "RECURRING";
  actorUserId?: number;
}

export function makeRegisterBookingSeries(deps: {
  bookings: BookingRepository;
  courts: CourtRepository;
  notifier: NotificationSender;
  admins: AdminDirectory;
  notifications: NotificationRepository;
}) {
  return async function registerBookingSeries(input: RegisterBookingSeriesInput) {
    if (!input.dates || input.dates.length === 0) {
      throw new HttpError(400, "La serie debe tener al menos una fecha.");
    }

    const startTime = new Date(`1970-01-01T${input.startTime}:00Z`);
    const endTime = new Date(`1970-01-01T${input.endTime}:00Z`);

    const court = await deps.courts.findByIdOrThrow(input.courtId);

    try {
      assertValidRange({ startTime, endTime });
      assertCourtAvailableForBooking(court);
      assertWithinOperatingHours(court.openTime, court.closeTime, { startTime, endTime });
      assertNonEmpty(input.customerName, "El nombre del cliente");
      assertPositiveAmount(input.totalAmount, "El monto total");
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    const customerName = normalizeText(input.customerName);

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
        const dateStr = input.dates[i]!;
        const date = new Date(dateStr);

        try {
          assertNotInPast(date, startTime);
        } catch (e) {
          throw new HttpError(400, `${(e as Error).message} (${dateStr})`);
        }

        const candidates = await tx.findActiveOverlapCandidates(input.courtId, date);
        if (hasConflict({ startTime, endTime }, candidates)) {
          throw new HttpError(409, `Ya existe un alquiler activo para esa cancha el ${dateStr}.`);
        }
        if (await tx.isTimeBlocked(input.courtId, date, { startTime, endTime })) {
          throw new HttpError(409, `Esa franja esta bloqueada por mantenimiento el ${dateStr}.`);
        }

        const amountForThisDate = input.seriesPaymentMode === "LUMP_SUM" ? (i === 0 ? input.totalAmount : 0) : input.totalAmount;

        const booking = await tx.create({
          courtId: input.courtId,
          customerId,
          customerName,
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

    const dateLabel = `${input.dates[0]} (+${total - 1} fecha(s) mas)`;

    if (input.customerEmail) {
      void deps.notifier.sendBookingConfirmation({
        to: input.customerEmail,
        customerName,
        courtName: court.name,
        date: dateLabel,
        startTime: input.startTime,
        endTime: input.endTime,
      });
    }

    const otherAdmins = await deps.admins.listOtherActiveAdmins(input.actorUserId);
    if (otherAdmins.length > 0) {
      const registeredByName = input.actorUserId ? await deps.admins.findAdminNameOrThrow(input.actorUserId) : "Un administrador";
      void deps.notifications.createForUsers(
        otherAdmins.map((a) => a.id),
        {
          type: "NEW_BOOKING",
          title: "Nueva serie de reservas registrada",
          message: `${registeredByName} registro una serie de ${total} fecha(s) en ${court.name}, desde ${dateLabel}.`,
        }
      );
      for (const admin of otherAdmins) {
        void deps.notifier.sendNewBookingAlert({
          to: admin.email,
          registeredByName,
          courtName: court.name,
          date: dateLabel,
          startTime: input.startTime,
          endTime: input.endTime,
        });
      }
    }

    return bookings;
  };
}
