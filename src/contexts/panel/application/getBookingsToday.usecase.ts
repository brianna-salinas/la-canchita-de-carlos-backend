import type { PanelRepository } from "../domain/model/ports/PanelRepository.js";

function todayRange(dateStr?: string) {
  const date = dateStr ? new Date(dateStr) : new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

export function makeGetBookingsToday(deps: { panel: PanelRepository }) {
  return function getBookingsToday(dateStr?: string) {
    return deps.panel.getBookingsForDate(todayRange(dateStr));
  };
}

export { todayRange };
