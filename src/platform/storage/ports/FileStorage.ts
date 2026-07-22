
export type UploadFolder = "canchas" | "perfiles" | "clientes" | "comprobantes";

export interface UploadFileInput {
  folder: UploadFolder;
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

export interface UploadResult {
  path: string; // ruta dentro del bucket (siempre disponible, para poder generar signed URLs despues).
  url: string | null; // URL publica, solo para carpetas publicas. null si es "comprobantes" (privado).
}

export interface FileStorage {
  upload(input: UploadFileInput): Promise<UploadResult>;
  // Genera una URL temporal para un archivo de la carpeta privada (comprobantes).
  createSignedUrl(path: string, expiresInSeconds: number): Promise<string>;
}
