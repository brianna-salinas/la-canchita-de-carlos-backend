import { todayRange } from "./getBookingsToday.usecase.js";
// US18 — ingreso total del dia, en base a los pagos reales (paidAmount), no a lo reservado.
export function makeGetIncomeToday(deps) {
    return async function getIncomeToday(dateStr) {
        const date = todayRange(dateStr);
        const total = await deps.panel.getPaidTotalForDate(date);
        return { date: date.toISOString().slice(0, 10), total };
    };
}
//# sourceMappingURL=getIncomeToday.usecase.js.map