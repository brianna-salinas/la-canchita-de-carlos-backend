export type UploadFolder = "canchas" | "perfiles" | "clientes" | "comprobantes";
export interface UploadFileInput {
    folder: UploadFolder;
    buffer: Buffer;
    mimeType: string;
    originalName: string;
}
export interface UploadResult {
    path: string;
    url: null;
}
export interface FileStorage {
    upload(input: UploadFileInput): Promise<UploadResult>;
    createSignedUrl(path: string, expiresInSeconds: number): Promise<string>;
}
//# sourceMappingURL=FileStorage.d.ts.map