import type { PanelRepository, PanelBookingSummary } from "../../domain/ports/PanelRepository.js";
export declare class PrismaPanelRepository implements PanelRepository {
    getBookingsForDate(date: Date): Promise<PanelBookingSummary[]>;
    getPaidTotalForDate(date: Date): Promise<number>;
    getPendingPaymentsForDate(date: Date): Promise<PanelBookingSummary[]>;
}
export declare const panelRepository: PanelRepository;
//# sourceMappingURL=PrismaPanelRepository.d.ts.map