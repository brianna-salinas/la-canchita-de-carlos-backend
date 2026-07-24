import type { CourtRepository } from "../domain/ports/CourtRepository.js";
export declare function makeListCourts(deps: {
    courts: CourtRepository;
}): () => Promise<import("../domain/model/Court.js").Court[]>;
//# sourceMappingURL=listCourts.usecase.d.ts.map