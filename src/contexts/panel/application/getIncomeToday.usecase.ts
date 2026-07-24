import type { PanelRepository } from "../domain/model/ports/PanelRepository.js";
import { todayRange } from "./getBookingsToday.usecase.js";

export function makeGetIncomeToday(deps: { panel: PanelRepository }) {
  return async function getIncomeToday(dateStr?: string) {
    const date = todayRange(dateStr);
    const total = await deps.panel.getPaidTotalForDate(date);
    return { date: date.toISOString().slice(0, 10), total };
  };
}
