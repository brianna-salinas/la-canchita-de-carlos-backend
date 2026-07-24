import type { PanelRepository } from "../domain/ports/PanelRepository.js";
export declare function makeGetIncomeToday(deps: {
    panel: PanelRepository;
}): (dateStr?: string) => Promise<{
    date: string;
    total: number;
}>;
//# sourceMappingURL=getIncomeToday.usecase.d.ts.map