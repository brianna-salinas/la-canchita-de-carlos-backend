import type { AccessRequestRepository, NewAccessRequestData } from "../../domain/ports/AccessRequestRepository.js";
import type { AccessRequest } from "../../domain/model/AccessRequest.js";
export declare class PrismaAccessRequestRepository implements AccessRequestRepository {
    findByEmailPending(email: string): Promise<AccessRequest | null>;
    create(data: NewAccessRequestData): Promise<AccessRequest>;
    findByIdOrThrow(requestId: number): Promise<AccessRequest>;
    markApproved(requestId: number, createdUserId: number): Promise<void>;
    markRejected(requestId: number): Promise<void>;
    listPending(): Promise<{
        createdAt: Date;
        email: string;
        id: number;
        name: string;
        phone: string | null;
    }[]>;
}
export declare const accessRequestRepository: AccessRequestRepository;
//# sourceMappingURL=PrismaAccessRequestRepository.d.ts.map