import type { ScheduleBlock } from "../aggregates/ScheduleBlock.js";

export interface ScheduleBlockRepository {
  createMany(courtId: number, date: Date, times: Date[], reason?: string): Promise<ScheduleBlock[]>;
  listForCourtAndDate(courtId: number, date: Date): Promise<ScheduleBlock[]>;
  // Todos los bloqueos de una cancha desde una fecha en adelante (incluida),
  // sin importar el dia — para poder ver/cancelar mantenimientos programados
  // (posiblemente en varias fechas, si era recurrente) desde Canchas.
  listUpcomingForCourt(courtId: number, fromDate: Date): Promise<ScheduleBlock[]>;
  deleteById(blockId: number): Promise<void>;
}
