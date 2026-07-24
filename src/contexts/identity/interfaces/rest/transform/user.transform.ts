import type { User } from "../../../domain/model/aggregates/User.js";
import type { FileStorage } from "../../../../../platform/storage/ports/FileStorage.js";
import { withSignedPhotoUrl, withSignedPhotoUrls } from "../../../../../platform/storage/photoUrl.helper.js";
import type { UserResource } from "../resources/user.resources.js";

function sinPasswordHash<T extends { passwordHash?: string }>(user: T): Omit<T, "passwordHash"> {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

export async function toUserResource(storage: FileStorage, user: User): Promise<UserResource> {
  return withSignedPhotoUrl(storage, sinPasswordHash(user));
}

export async function toUserResources<T extends { photoUrl?: string | null }>(
  storage: FileStorage,
  users: T[],
): Promise<T[]> {
  return withSignedPhotoUrls(storage, users);
}
