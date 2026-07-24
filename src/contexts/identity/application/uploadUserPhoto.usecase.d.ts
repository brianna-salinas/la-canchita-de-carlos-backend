import type { UserRepository } from "../domain/ports/UserRepository.js";
import type { FileStorage } from "../../../platform/storage/ports/FileStorage.js";
export declare function makeUploadUserPhoto(deps: {
    users: UserRepository;
    storage: FileStorage;
}): (userId: number, file: {
    buffer: Buffer;
    mimetype: string;
    originalname: string;
}) => Promise<import("../domain/model/User.js").User>;
//# sourceMappingURL=uploadUserPhoto.usecase.d.ts.map