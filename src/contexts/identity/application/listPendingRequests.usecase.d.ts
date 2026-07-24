import type { AccessRequestRepository } from "../domain/ports/AccessRequestRepository.js";
export declare function makeListPendingRequests(deps: {
    accessRequests: AccessRequestRepository;
}): () => Promise<Pick<import("../domain/model/AccessRequest.js").AccessRequest, "createdAt" | "email" | "id" | "name" | "phone">[]>;
//# sourceMappingURL=listPendingRequests.usecase.d.ts.map