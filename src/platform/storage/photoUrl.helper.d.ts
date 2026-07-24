import type { FileStorage } from "./ports/FileStorage.js";
export declare function withSignedPhotoUrl<T extends {
    photoUrl?: string | null;
}>(storage: FileStorage, entity: T): Promise<T>;
export declare function withSignedPhotoUrls<T extends {
    photoUrl?: string | null;
}>(storage: FileStorage, entities: T[]): Promise<T[]>;
//# sourceMappingURL=photoUrl.helper.d.ts.map