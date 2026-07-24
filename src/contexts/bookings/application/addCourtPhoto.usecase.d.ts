import type { CourtRepository } from "../domain/ports/CourtRepository.js";
import type { FileStorage } from "../../../platform/storage/ports/FileStorage.js";
export declare function makeAddCourtPhoto(deps: {
    courts: CourtRepository;
    storage: FileStorage;
}): (courtId: number, file: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}) => Promise<import("../domain/model/Court.js").Court>;
//# sourceMappingURL=addCourtPhoto.usecase.d.ts.map