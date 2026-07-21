// Entidad de dominio pura del aggregate ScheduleBlock (RF07/RF32): franja bloqueada
// manualmente por mantenimiento, con motivo opcional, excluida de la disponibilidad.
export interface ScheduleBlock {
  id: number;
  courtId: number;
  date: Date;
  time: Date;
  reason?: string | null;
}

export function assertValidBlockRange(startTime: Date, endTime: Date): void {
  if (endTime <= startTime) {
    throw new Error("La hora de fin debe ser posterior a la hora de inicio.");
  }
}

// Genera los puntos horarios (uno por hora) entre startTime y endTime, ya que la
// disponibilidad se chequea contra bloques de una hora (misma granularidad que Booking).
export function hourlySlots(startTime: Date, endTime: Date): Date[] {
  const slots: Date[] = [];
  const cursor = new Date(startTime);
  while (cursor < endTime) {
    slots.push(new Date(cursor));
    cursor.setUTCHours(cursor.getUTCHours() + 1);
  }
  return slots;
}
