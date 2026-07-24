export type CourtStatus = "ACTIVE" | "MAINTENANCE";

export interface Court {
  id: number;
  name: string;
  sport: string;
  surface?: string | null;
  pricePerHour: number;
  photoUrl?: string | null;
  status: CourtStatus;
  enabled: boolean;
  description?: string | null;

  openTime?: string | null;
  closeTime?: string | null;
}

export function assertValidPrice(pricePerHour: number): void {
  if (pricePerHour <= 0) {
    throw new Error("El precio debe ser mayor a cero.");
  }
}

export function assertCourtAvailableForBooking(court: Pick<Court, "status" | "enabled">): void {
  if (!court.enabled) {
    throw new Error("Esta cancha no está disponible (deshabilitada).");
  }
  if (court.status === "MAINTENANCE") {
    throw new Error("Esta cancha está en mantenimiento y no se puede reservar.");
  }
}

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export function assertValidOperatingHours(openTime: string, closeTime: string): void {
  if (!TIME_REGEX.test(openTime) || !TIME_REGEX.test(closeTime)) {
    throw new Error("El horario de atencion debe tener formato HH:MM (24 horas).");
  }
  if (openTime >= closeTime) {
    throw new Error("La hora de apertura debe ser anterior a la hora de cierre.");
  }
}
