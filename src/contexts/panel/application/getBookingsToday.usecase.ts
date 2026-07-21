import type { PanelRepository } from "../domain/ports/PanelRepository.js";

function todayRange(dateStr?: string) {
  const date = dateStr ? new Date(dateStr) : new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

// US17 — alquileres del dia (excluye cancelados).
export function makeGetBookingsToday(deps: { panel: PanelRepository }) {
  return function getBookingsToday(dateStr?: string) {
    return deps.panel.getBookingsForDate(todayRange(dateStr));
  };
}

export { todayRange };
