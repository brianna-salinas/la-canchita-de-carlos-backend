import type { CourtRepository } from "../domain/ports/CourtRepository.js";
export interface RegisterCourtInput {
    name: string;
    sport: string;
    surface?: string;
    pricePerHour: number;
    openTime?: string;
    closeTime?: string;
}
export declare function makeRegisterCourt(deps: {
    courts: CourtRepository;
}): (input: RegisterCourtInput) => Promise<import("../domain/model/Court.js").Court>;
//# sourceMappingURL=registerCourt.usecase.d.ts.map