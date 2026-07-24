import type { FileStorage } from "./ports/FileStorage.js";

const EXPIRES_IN_SECONDS = 3600;

async function resolveOne(storage: FileStorage, path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  try {
    return await storage.createSignedUrl(path, EXPIRES_IN_SECONDS);
  } catch {

    return null;
  }
}

export async function withSignedPhotoUrl<T extends { photoUrl?: string | null }>(
  storage: FileStorage,
  entity: T,
): Promise<T> {
  return { ...entity, photoUrl: await resolveOne(storage, entity.photoUrl) };
}

export async function withSignedPhotoUrls<T extends { photoUrl?: string | null }>(
  storage: FileStorage,
  entities: T[],
): Promise<T[]> {
  return Promise.all(entities.map((e) => withSignedPhotoUrl(storage, e)));
}
