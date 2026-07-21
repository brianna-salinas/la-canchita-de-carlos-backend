// Puerto para subir archivos binarios. Un solo bucket de Supabase Storage, con seguridad
// aplicada por CARPETA (no por bucket): "canchas", "perfiles" y "clientes" son de lectura
// publica (policies RLS de storage.objects lo permiten); "comprobantes" es privado, solo
// accesible generando una URL firmada de vida corta (TS08). El adaptador concreto
// (SupabaseFileStorage.ts) implementa esto contra Supabase Storage; podria reemplazarse
// por S3 sin tocar casos de uso.
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
