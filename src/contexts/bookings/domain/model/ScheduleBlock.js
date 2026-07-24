export function assertValidBlockRange(startTime, endTime) {
    if (endTime <= startTime) {
        throw new Error("La hora de fin debe ser posterior a la hora de inicio.");
    }
}
export function hourlySlots(startTime, endTime) {
    const slots = [];
    const cursor = new Date(startTime);
    while (cursor < endTime) {
        slots.push(new Date(cursor));
        cursor.setUTCHours(cursor.getUTCHours() + 1);
    }
    return slots;
}
//# sourceMappingURL=ScheduleBlock.js.map