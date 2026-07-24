export type AccessRequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export interface AccessRequest {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    passwordHash: string;
    status: AccessRequestStatus;
    createdAt: Date;
}
export declare function assertPending(request: Pick<AccessRequest, "status">): void;
//# sourceMappingURL=AccessRequest.d.ts.map