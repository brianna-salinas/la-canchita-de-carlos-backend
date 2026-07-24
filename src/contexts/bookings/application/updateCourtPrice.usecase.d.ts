import type { CourtRepository } from "../domain/ports/CourtRepository.js";
export declare function makeUpdateCourtPrice(deps: {
    courts: CourtRepository;
}): (courtId: number, pricePerHour: number) => Promise<import("../domain/model/Court.js").Court>;
//# sourceMappingURL=updateCourtPrice.usecase.d.ts.map