import type { PanelRepository } from "../domain/ports/PanelRepository.js";
export declare function makeGetPendingPaymentsToday(deps: {
    panel: PanelRepository;
}): (dateStr?: string) => Promise<{
    id: number;
    startTime: Date;
    endTime: Date;
    totalAmount: number;
    paidAmount: number;
    paymentStatus: "PENDING" | "PARTIAL" | "PAID";
    court: {
        id: number;
        name: string;
    };
    customer: {
        id: number;
        name: string;
    } | null;
    balance: number;
}[]>;
//# sourceMappingURL=getPendingPaymentsToday.usecase.d.ts.map