import type { CourtRepository, UpdateCourtData } from "../domain/ports/CourtRepository.js";
import { assertNonEmpty, assertMaxLength, normalizeText } from "../../../platform/validation/validators.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export interface UpdateCourtInput {
  name?: string;
  sport?: string;
  surface?: string;
  description?: string;
  status?: "ACTIVE" | "MAINTENANCE";
}

// US26-US30 — edita los datos generales de una cancha ya creada
// (nombre, deporte, superficie, descripcion, estado operativo). El
// precio y la foto tienen su propio endpoint dedicado (updateCourtPrice
// / addCourtPhoto) porque ya existian antes de esto.
export function makeUpdateCourt(deps: { courts: CourtRepository }) {
  return async function updateCourt(courtId: number, input: UpdateCourtInput) {
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
    } catch (e) {
      throw new HttpError(400, (e as Error).message);
    }

    if (input.surface !== undefined) data.surface = input.surface;
    if (input.description !== undefined) data.description = input.description;
    if (input.status !== undefined) data.status = input.status;

    await deps.courts.findByIdOrThrow(courtId);
    return deps.courts.update(courtId, data);
  };
}
