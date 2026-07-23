import type { Court, CourtStatus } from "../model/Court.js";

export interface NewCourtData {
  name: string;
  sport: string;
  surface?: string;
  pricePerHour: number;
  // Ambos opcionales: si no se mandan, la cancha queda sin restriccion de
  // horario (disponible las 24 horas).
  openTime?: string | null;
  closeTime?: string | null;
}

export interface UpdateCourtData {
  name?: string;
  sport?: string;
  surface?: string;
  description?: string;
  status?: CourtStatus;
  openTime?: string | null;
  closeTime?: string | null;
  // Pausar/reanudar una cancha sin borrarla: mientras enabled=false, la
  // cancha no aparece en disponibilidad/calendario/nueva reserva, pero
  // sigue existiendo y se puede reactivar. Distinto de delete(), que es
  // un borrado real e irreversible.
  enabled?: boolean;
}

// US13 — disponibilidad consolidada: cada cancha con sus bookings activos y bloqueos
// de mantenimiento para la fecha consultada.
export type CourtAvailability = Court & {
  bookings: { id: number; startTime: Date; endTime: Date }[];
  scheduleBlocks: { id: number; time: Date }[];
};

export interface CourtRepository {
  findByName(name: string): Promise<Court | null>;
  create(data: NewCourtData): Promise<Court>;
  update(courtId: number, data: UpdateCourtData): Promise<Court>;
  updatePrice(courtId: number, pricePerHour: number): Promise<Court>;
  updatePhoto(courtId: number, photoUrl: string): Promise<Court>;
  // Borrado real e irreversible (ver migracion court_delete_cascade): borra
  // la cancha y, en cascada a nivel de base de datos, sus bloqueos de
  // horario, sus reservas y los pagos de esas reservas.
  delete(courtId: number): Promise<void>;
  getConsolidatedAvailability(date: Date): Promise<CourtAvailability[]>;
  // Listado completo para administracion (incluye canchas pausadas,
  // enabled=false), a diferencia de getConsolidatedAvailability que solo
  // trae las habilitadas (uso de reservas/calendario).
  listAll(): Promise<Court[]>;
  findByIdOrThrow(courtId: number): Promise<Court>;
}
