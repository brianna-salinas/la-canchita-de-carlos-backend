export type CourtStatus = "ACTIVE" | "MAINTENANCE";
export interface Court {
    id: number;
    name: string;
    sport: string;
    surface?: string | null;
    pricePerHour: number;
    photoUrl?: string | null;
    status: CourtStatus;
    enabled: boolean;
    description?: string | null;
    openTime?: string | null;
    closeTime?: string | null;
}
export declare function assertValidPrice(pricePerHour: number): void;
export declare function assertCourtAvailableForBooking(court: Pick<Court, "status" | "enabled">): void;
export declare function assertValidOperatingHours(openTime: string, closeTime: string): void;
//# sourceMappingURL=Court.d.ts.map