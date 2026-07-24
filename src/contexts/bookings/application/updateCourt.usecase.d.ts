import type { CourtRepository } from "../domain/ports/CourtRepository.js";
export interface UpdateCourtInput {
    name?: string;
    sport?: string;
    surface?: string;
    description?: string;
    status?: "ACTIVE" | "MAINTENANCE";
    openTime?: string | null;
    closeTime?: string | null;
    enabled?: boolean;
}
export declare function makeUpdateCourt(deps: {
    courts: CourtRepository;
}): (courtId: number, input: UpdateCourtInput) => Promise<import("../domain/model/Court.js").Court>;
//# sourceMappingURL=updateCourt.usecase.d.ts.map