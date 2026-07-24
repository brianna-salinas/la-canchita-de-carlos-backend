import type { CourtRepository } from "../domain/ports/CourtRepository.js";
export declare function makeGetConsolidatedAvailability(deps: {
    courts: CourtRepository;
}): (date: string) => Promise<import("../domain/ports/CourtRepository.js").CourtAvailability[]>;
//# sourceMappingURL=getConsolidatedAvailability.usecase.d.ts.map