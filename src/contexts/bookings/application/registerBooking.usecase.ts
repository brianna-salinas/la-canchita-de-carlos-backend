import type { BookingRepository } from "../domain/model/ports/BookingRepository.js";
import type { CourtRepository } from "../domain/model/ports/CourtRepository.js";
import type { AdminDirectory } from "../domain/model/ports/AdminDirectory.js";
import type { NotificationSender } from "../../notifications/application/ports/NotificationSender.js";
import type { NotificationRepository } from "../../notifications/domain/model/ports/NotificationRepository.js";
import { assertValidRange, assertNotInPast, assertWithinOperatingHours, hasConflict } from "../domain/model/aggregates/Booking.js";
import { assertCourtAvailableForBooking } from "../domain/model/aggregates/Court.js";
import { assertNonEmpty, assertPositiveAmount, normalizeText } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface RegisterBookingInput {
  courtId: number;
  customerId?: number;
  clienteNuevo?: { name: string; phone: string; documentNumber?: string };
  customerName: string;
  customerEmail?: string;
  type?: string;
  date: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  actorUserId?: number;
}

export function makeRegisterBooking(deps: {
  bookings: BookingRepository;
  courts: CourtRepository;
  notifier: NotificationSender;
  admins: AdminDirectory;
  notifications: NotificationRepository;
}) {
  return async function registerBooking(input: RegisterBookingInput) {
    const date = new Date(input.date);
    const startTime = new Date(`1970-01-01T${input.startTime}:00Z`);
    const endTime = new Date(`1970-01-01T${input.endTime}:00Z`);

    const court = await deps.courts.findByIdOrThrow(input.courtId);

    try {
      assertValidRange({ startTime, endTime });
      assertNotInPast(date, startTime);
      assertCourtAvailableForBooking(court);
      assertWithinOperatingHours(court.openTime, court.closeTime, { startTime, endTime });
      assertNonEmpty(input.customerName, "El nombre del cliente");
      assertPositiveAmount(input.totalAmount, "El monto total");
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    const customerName = normalizeText(input.customerName);

    const booking = await deps.bookings.runTransaction(async (tx) => {
      const candidates = await tx.findActiveOverlapCandidates(input.courtId, date);
      if (hasConflict({ startTime, endTime }, candidates)) {

        throw new HttpError(409, "Ya existe un alquiler activo para esa cancha en ese horario.");
      }
      if (await tx.isTimeBlocked(input.courtId, date, { startTime, endTime })) {
        throw new HttpError(409, "Esa franja esta bloqueada por mantenimiento.");
      }

      let customerId = input.customerId;

      if (!customerId && input.clienteNuevo) {
        const customer = await tx.createEmbeddedCustomer(input.clienteNuevo);
        customerId = customer.id;
      }

      return tx.create({
        courtId: input.courtId,
        customerId,
        customerName,
        type: input.type,
        date,
        startTime,
        endTime,
        totalAmount: input.totalAmount,
      });
    });

    if (input.customerEmail) {
      void deps.notifier.sendBookingConfirmation({
        to: input.customerEmail,
        customerName,
        courtName: court.name,
        date: input.date,
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
          title: "Nueva reserva registrada",
          message: `${registeredByName} registro ${court.name} el ${input.date} de ${input.startTime} a ${input.endTime}.`,
        }
      );
      for (const admin of otherAdmins) {
        void deps.notifier.sendNewBookingAlert({
          to: admin.email,
          registeredByName,
          courtName: court.name,
          date: input.date,
          startTime: input.startTime,
          endTime: input.endTime,
        });
      }
    }

    return booking;
  };
}
