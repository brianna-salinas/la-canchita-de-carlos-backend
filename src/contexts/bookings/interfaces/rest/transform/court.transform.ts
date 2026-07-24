import type { Court } from "../../../domain/model/aggregates/Court.js";
import type { FileStorage } from "../../../../../platform/storage/ports/FileStorage.js";
import { withSignedPhotoUrl, withSignedPhotoUrls } from "../../../../../platform/storage/photoUrl.helper.js";
import type { CourtResource } from "../resources/court.resources.js";

export async function toCourtResource(storage: FileStorage, court: Court): Promise<CourtResource> {
  return withSignedPhotoUrl(storage, court);
}

export async function toCourtResources(storage: FileStorage, courts: Court[]): Promise<CourtResource[]> {
  return withSignedPhotoUrls(storage, courts);
}
