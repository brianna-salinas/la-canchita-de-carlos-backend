
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

export function assertPending(request: Pick<AccessRequest, "status">): void {
  if (request.status !== "PENDING") {
    throw new Error("Esta solicitud ya fue resuelta.");
  }
}
