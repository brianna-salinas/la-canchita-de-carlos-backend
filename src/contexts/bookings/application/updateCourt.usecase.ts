import type { CourtRepository, UpdateCourtData } from "../domain/model/ports/CourtRepository.js";
import { assertNonEmpty, assertMaxLength, normalizeText } from "../../../platform/validation/validators.js";
import { assertValidOperatingHours } from "../domain/model/aggregates/Court.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface UpdateCourtInput {
  name?: string;
  sport?: string;
  surface?: string;
  description?: string;
  status?: "ACTIVE" | "MAINTENANCE";

  openTime?: string | null;
  closeTime?: string | null;

  enabled?: boolean;
}

export function makeUpdateCourt(deps: { courts: CourtRepository }) {
  return async function updateCourt(courtId: number, input: UpdateCourtInput) {
    const actual = await deps.courts.findByIdOrThrow(courtId);
    const data: UpdateCourtData = {};

    try {
      if (input.name !== undefined) {
        assertNonEmpty(input.name, "El nombre de la cancha");
        assertMaxLength(input.name, 100, "El nombre de la cancha");
        data.name = normalizeText(input.name);
      }
      if (input.sport !== undefined) {
        assertNonEmpty(input.sport, "El deporte");
        data.sport = normalizeText(input.sport);
      }

      if (input.openTime !== undefined || input.closeTime !== undefined) {
        const openTime = (input.openTime !== undefined ? input.openTime : actual.openTime) || null;
        const closeTime = (input.closeTime !== undefined ? input.closeTime : actual.closeTime) || null;
        if (openTime || closeTime) {
          if (!openTime || !closeTime) {
            throw new Error("Debes indicar tanto la hora de apertura como la de cierre, o dejar ambas vacías.");
          }
          assertValidOperatingHours(openTime, closeTime);
        }
        data.openTime = openTime;
        data.closeTime = closeTime;
      }
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    if (input.surface !== undefined) data.surface = input.surface;
    if (input.description !== undefined) data.description = input.description;
    if (input.status !== undefined) data.status = input.status;
    if (input.enabled !== undefined) data.enabled = input.enabled;

    return deps.courts.update(courtId, data);
  };
}
