import type { Court, CourtStatus } from "../model/Court.js";

export interface NewCourtData {
  name: string;
  sport: string;
  surface?: string;
  pricePerHour: number;
}

export interface UpdateCourtData {
  name?: string;
  sport?: string;
  surface?: string;
  description?: string;
  status?: CourtStatus;
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
  // Soft-delete: no se borra la fila (hay reservas/bloqueos ligados por
  // FK), se marca enabled=false para que deje de ofrecerse.
  deactivate(courtId: number): Promise<Court>;
  getConsolidatedAvailability(date: Date): Promise<CourtAvailability[]>;
  findByIdOrThrow(courtId: number): Promise<Court>;
}
