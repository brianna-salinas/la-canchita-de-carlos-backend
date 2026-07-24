function todayRange(dateStr) {
    const date = dateStr ? new Date(dateStr) : new Date();
    date.setUTCHours(0, 0, 0, 0);
    return date;
}
// US17 — alquileres del dia (excluye cancelados).
export function makeGetBookingsToday(deps) {
    return function getBookingsToday(dateStr) {
        return deps.panel.getBookingsForDate(todayRange(dateStr));
    };
}
export { todayRange };
//# sourceMappingURL=getBookingsToday.usecase.js.map