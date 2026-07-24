import type { CourtRepository, NewCourtData, UpdateCourtData, CourtAvailability } from "../../domain/ports/CourtRepository.js";
import type { Court } from "../../domain/model/Court.js";
export declare class PrismaCourtRepository implements CourtRepository {
    findByName(name: string): Promise<Court | null>;
    create(data: NewCourtData): Promise<Court>;
    update(courtId: number, data: UpdateCourtData): Promise<Court>;
    updatePrice(courtId: number, pricePerHour: number): Promise<Court>;
    delete(courtId: number): Promise<void>;
    listAll(): Promise<Court[]>;
    updatePhoto(courtId: number, photoUrl: string): Promise<Court>;
    getConsolidatedAvailability(date: Date): Promise<CourtAvailability[]>;
    findByIdOrThrow(courtId: number): Promise<Court>;
}
export declare const courtRepository: CourtRepository;
//# sourceMappingURL=PrismaCourtRepository.d.ts.map