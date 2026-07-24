import type { PanelRepository } from "../domain/model/ports/PanelRepository.js";
import { todayRange } from "./getBookingsToday.usecase.js";

export function makeGetPendingPaymentsToday(deps: { panel: PanelRepository }) {
  return async function getPendingPaymentsToday(dateStr?: string) {
    const date = todayRange(dateStr);
    const bookings = await deps.panel.getPendingPaymentsForDate(date);
    return bookings.map((b) => ({ ...b, balance: b.totalAmount - b.paidAmount }));
  };
}
