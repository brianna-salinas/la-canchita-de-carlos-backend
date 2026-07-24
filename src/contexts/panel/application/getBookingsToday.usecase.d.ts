import type { PanelRepository } from "../domain/ports/PanelRepository.js";
declare function todayRange(dateStr?: string): Date;
export declare function makeGetBookingsToday(deps: {
    panel: PanelRepository;
}): (dateStr?: string) => Promise<import("../domain/ports/PanelRepository.js").PanelBookingSummary[]>;
export { todayRange };
//# sourceMappingURL=getBookingsToday.usecase.d.ts.map