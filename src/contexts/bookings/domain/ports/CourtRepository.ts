import type { Court } from "../model/Court.js";

export interface NewCourtData {
  name: string;
  sport: string;
  surface?: string;
  pricePerHour: number;
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
  updatePrice(courtId: number, pricePerHour: number): Promise<Court>;
  updatePhoto(courtId: number, photoUrl: string): Promise<Court>;
  getConsolidatedAvailability(date: Date): Promise<CourtAvailability[]>;
  findByIdOrThrow(courtId: number): Promise<Court>;
}
