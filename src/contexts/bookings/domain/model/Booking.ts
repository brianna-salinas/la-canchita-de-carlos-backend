export type BookingStatus = "BOOKED" | "CANCELLED" | "COMPLETED";
export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID";

export type BookingSeriesType = "SINGLE" | "MULTIDAY" | "RECURRING";
export type SeriesPaymentMode = "INDIVIDUAL" | "LUMP_SUM";

export interface Booking {
  id: number;
  courtId: number;
  customerId?: number | null;
  customerName: string;
  type?: string | null;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  receiptUrl?: string | null;
  bookingType?: BookingSeriesType;
  seriesId?: string | null;
  seriesPaymentMode?: SeriesPaymentMode | null;
  seriesLabel?: string | null;
  seriesTotalDates?: number | null;
  seriesIndex?: number | null;
}

export interface TimeRange {
  startTime: Date;
  endTime: Date;
}

// RF06 — invariante central del dominio: no puede existir otro Booking activo que se
// superponga con la misma cancha + franja horaria. Regla pura y testeable sin DB ni servidor.
export function overlaps(candidate: TimeRange, existing: TimeRange): boolean {
  return candidate.startTime < existing.endTime && candidate.endTime > existing.startTime;
}

export function hasConflict(
  candidate: TimeRange,
  activeBookings: (TimeRange & { id: number })[],
  excludeBookingId?: number
): boolean {
  return activeBookings.some((b) => b.id !== excludeBookingId && overlaps(candidate, b));
}

// Deriva el estado de pago de forma consistente cuando se edita totalAmount/paidAmount
// directamente (fuera del flujo normal de registerPayment.usecase.ts en Payments).
export function resolvePaymentStatus(totalAmount: number, paidAmount: number): PaymentStatus {
  if (paidAmount <= 0) return "PENDING";
  if (paidAmount >= totalAmount) return "PAID";
  return "PARTIAL";
}

export function assertValidRange(range: TimeRange): void {
  if (range.endTime <= range.startTime) {
    throw new Error("La hora de fin debe ser posterior a la hora de inicio.");
  }
}

// Cada cancha puede tener su propio horario de atencion (openTime/closeTime
// en Court, opcional). Antes esto solo se usaba para pintar el calendario
// en el frontend; el backend nunca revisaba que una reserva realmente
// cayera dentro de ese horario, asi que se podia crear (o editar) una
// reserva a las 6am para una cancha que abre a las 8am. Si la cancha no
// tiene horario configurado (null), se considera abierta las 24 horas.
export function assertWithinOperatingHours(
  openTime: string | null | undefined,
  closeTime: string | null | undefined,
  range: TimeRange
): void {
  if (!openTime || !closeTime) return;

  const toMinutes = (hhmm: string): number => {
    const [h, m] = hhmm.split(":");
    return Number(h) * 60 + Number(m);
  };
  const openMin = toMinutes(openTime);
  const closeMin = toMinutes(closeTime);
  const startMin = range.startTime.getUTCHours() * 60 + range.startTime.getUTCMinutes();
  const endMin = range.endTime.getUTCHours() * 60 + range.endTime.getUTCMinutes();

  if (startMin < openMin || endMin > closeMin) {
    throw new Error(`Esta cancha solo esta disponible de ${openTime} a ${closeTime}.`);
  }
}

// El sistema opera en Peru (UTC-5), pero el servidor puede correr en cualquier
// timezone (en el sandbox de desarrollo corre en UTC). Para saber "que dia y
// hora es ahora" de forma consistente con como se guardan date/startTime
// (componentes de calendario en horario de Peru, representados como Date UTC
// por conveniencia de parseo), se usa Intl con timeZone America/Lima en vez
// de los getters locales del servidor.
const PERU_TIME_ZONE = "America/Lima";

function getPeruDateTimeParts(now: Date): { year: number; month: number; day: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: PERU_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute") };
}

// RF?? — no tiene sentido registrar (ni reprogramar) una reserva en una fecha
// u hora que ya paso. `date` es el dia de la reserva (componentes UTC = dia
// calendario en Peru) y `startTime` es la hora de inicio (componentes UTC =
// hora del dia en Peru). `now` es opcional para poder testear con una hora
// fija.
export function assertNotInPast(date: Date, startTime: Date, now: Date = new Date()): void {
  const nowParts = getPeruDateTimeParts(now);
  const bookingDateUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const nowDateUTC = Date.UTC(nowParts.year, nowParts.month - 1, nowParts.day);

  if (bookingDateUTC < nowDateUTC) {
    throw new Error("No se pueden registrar reservas en fechas pasadas.");
  }

  if (bookingDateUTC === nowDateUTC) {
    const bookingMinutes = startTime.getUTCHours() * 60 + startTime.getUTCMinutes();
    const nowMinutes = nowParts.hour * 60 + nowParts.minute;
    if (bookingMinutes < nowMinutes) {
      throw new Error("No se pueden registrar reservas en un horario que ya paso.");
    }
  }
}
