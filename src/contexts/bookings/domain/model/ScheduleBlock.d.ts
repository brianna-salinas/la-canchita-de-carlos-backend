export interface ScheduleBlock {
    id: number;
    courtId: number;
    date: Date;
    time: Date;
    reason?: string | null;
}
export declare function assertValidBlockRange(startTime: Date, endTime: Date): void;
export declare function hourlySlots(startTime: Date, endTime: Date): Date[];
//# sourceMappingURL=ScheduleBlock.d.ts.map