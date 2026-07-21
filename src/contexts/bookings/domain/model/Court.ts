// Entidad de dominio pura del aggregate Court (parte del bounded context Bookings:
// la disponibilidad de canchas es inseparable de la regla de no-doble-reserva).
export interface Court {
  id: number;
  name: string;
  sport: string;
  surface?: string | null;
  pricePerHour: number;
  photoUrl?: string | null;
}

// RF12 — el precio por hora nunca puede ser cero ni negativo. Regla pura.
export function assertValidPrice(pricePerHour: number): void {
  if (pricePerHour <= 0) {
    throw new Error("El precio debe ser mayor a cero.");
  }
}
