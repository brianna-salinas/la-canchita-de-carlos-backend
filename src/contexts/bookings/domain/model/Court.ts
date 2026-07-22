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
}

// RF12 — el precio por hora nunca puede ser cero ni negativo. Regla pura.
export function assertValidPrice(pricePerHour: number): void {
  if (pricePerHour <= 0) {
    throw new Error("El precio debe ser mayor a cero.");
  }
}
