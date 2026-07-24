import type { Court, CourtStatus } from "../model/Court.js";
export interface NewCourtData {
    name: string;
    sport: string;
    surface?: string;
    pricePerHour: number;
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
    enabled?: boolean;
}
export type CourtAvailability = Court & {
    bookings: {
        id: number;
        startTime: Date;
        endTime: Date;
    }[];
    scheduleBlocks: {
        id: number;
        time: Date;
    }[];
};
export interface CourtRepository {
    findByName(name: string): Promise<Court | null>;
    create(data: NewCourtData): Promise<Court>;
    update(courtId: number, data: UpdateCourtData): Promise<Court>;
    updatePrice(courtId: number, pricePerHour: number): Promise<Court>;
    updatePhoto(courtId: number, photoUrl: string): Promise<Court>;
    delete(courtId: number): Promise<void>;
    getConsolidatedAvailability(date: Date): Promise<CourtAvailability[]>;
    listAll(): Promise<Court[]>;
    findByIdOrThrow(courtId: number): Promise<Court>;
}
//# sourceMappingURL=CourtRepository.d.ts.map