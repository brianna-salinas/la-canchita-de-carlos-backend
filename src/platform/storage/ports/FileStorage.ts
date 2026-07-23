
export type UploadFolder = "canchas" | "perfiles" | "clientes" | "comprobantes";

export interface UploadFileInput {
  folder: UploadFolder;
  buffer: Buffer;
  mimeType: string;
  originalName: string;
}

export interface UploadResult {
  path: string; // ruta dentro del bucket, para poder generar signed URLs despues.
  // Antes esto traia una URL publica fija para canchas/perfiles/clientes
  // (getPublicUrl), pero el bucket es privado (por diseno, para poder
  // ocultar los comprobantes de pago) asi que esa URL nunca funcionaba:
  // devolvia 404 "Bucket not found" al pedirla, porque el endpoint publico
  // de Supabase Storage no sirve nada de un bucket no marcado como
  // publico, sin importar las policies de RLS que tenga. Por eso ahora
  // el bucket es siempre privado y esto queda null siempre: toda lectura
  // pasa por createSignedUrl.
  url: null;
}

export interface FileStorage {
  upload(input: UploadFileInput): Promise<UploadResult>;
  // Genera una URL temporal para leer un archivo del bucket privado
  // (comprobantes, canchas, perfiles, clientes).
  createSignedUrl(path: string, expiresInSeconds: number): Promise<string>;
}
