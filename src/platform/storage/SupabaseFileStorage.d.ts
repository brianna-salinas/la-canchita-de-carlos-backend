import "dotenv/config";
import type { FileStorage, UploadFileInput, UploadResult } from "./ports/FileStorage.js";
export declare class SupabaseFileStorage implements FileStorage {
    upload({ folder, buffer, mimeType, originalName }: UploadFileInput): Promise<UploadResult>;
    createSignedUrl(path: string, expiresInSeconds: number): Promise<string>;
}
//# sourceMappingURL=SupabaseFileStorage.d.ts.map