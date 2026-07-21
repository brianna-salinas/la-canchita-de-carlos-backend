// Puerto para subir archivos binarios (fotos de canchas TS10, comprobantes de pago TS08).
// El adaptador concreto (infrastructure/storage/SupabaseFileStorage.ts) implementa esto
// contra Supabase Storage; podria reemplazarse por S3 sin tocar los casos de uso.
export interface UploadFileInput {
  folder: "comprobantes" | "canchas";
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

export interface FileStorage {
  upload(input: UploadFileInput): Promise<string>;
}
