import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { HttpError } from "../errors/HttpError.js";
import type { FileStorage, UploadFileInput, UploadResult } from "./ports/FileStorage.js";

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "la-canchita-de-carlos";

const supabase =
  SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) : null;

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export class SupabaseFileStorage implements FileStorage {
  async upload({ folder, buffer, mimeType, originalName }: UploadFileInput): Promise<UploadResult> {
    if (!ALLOWED_MIME.includes(mimeType)) {
      throw new HttpError(400, "Formato de imagen no soportado (usa jpg, png o webp).");
    }
    if (buffer.length > MAX_SIZE_BYTES) {
      throw new HttpError(400, "La imagen supera el tamano maximo permitido (5 MB).");
    }
    if (!supabase) {
      throw new HttpError(500, "Supabase Storage no esta configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    }

    const ext = originalName.split(".").pop() ?? "jpg";
    const path = `${folder}/${randomUUID()}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
      contentType: mimeType,
      upsert: false,
    });

    if (error) {
      throw new HttpError(500, `No se pudo subir la imagen: ${error.message}`);
    }

    return { path, url: null };
  }

  async createSignedUrl(path: string, expiresInSeconds: number): Promise<string> {
    if (!supabase) {
      throw new HttpError(500, "Supabase Storage no esta configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    }
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
    if (error || !data) {
      throw new HttpError(500, `No se pudo generar el enlace del comprobante: ${error?.message ?? "desconocido"}`);
    }
    return data.signedUrl;
  }

  async delete(path: string): Promise<void> {
    if (!supabase) {
      throw new HttpError(500, "Supabase Storage no esta configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
    }
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    if (error) {
      throw new HttpError(500, `No se pudo eliminar el archivo: ${error.message}`);
    }
  }
}
