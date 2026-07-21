import type { AccessRequest } from "../model/AccessRequest.js";

export interface NewAccessRequestData {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
}

export interface AccessRequestRepository {
  findByEmailPending(email: string): Promise<AccessRequest | null>;
  create(data: NewAccessRequestData): Promise<AccessRequest>;
  findByIdOrThrow(requestId: number): Promise<AccessRequest>;
  markApproved(requestId: number, createdUserId: number): Promise<void>;
  markRejected(requestId: number): Promise<void>;
  listPending(): Promise<Pick<AccessRequest, "id" | "name" | "email" | "phone" | "createdAt">[]>;
}
