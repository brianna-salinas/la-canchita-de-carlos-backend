import type { CourtRepository } from "../domain/ports/CourtRepository.js";
export declare function makeDeleteCourt(deps: {
    courts: CourtRepository;
}): (courtId: number) => Promise<void>;
//# sourceMappingURL=deleteCourt.usecase.d.ts.map