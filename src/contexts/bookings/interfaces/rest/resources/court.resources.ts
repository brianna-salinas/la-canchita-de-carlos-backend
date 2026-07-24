import type { Court } from "../../../domain/model/aggregates/Court.js";

export type CourtResource = Court;

export interface UpdateCourtPriceRequest {
  pricePerHour: number;
}
