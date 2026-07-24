import type { AccessRequestRepository } from "../domain/ports/AccessRequestRepository.js";
import type { NotificationSender } from "../../notifications/application/ports/NotificationSender.js";
export declare function makeRejectAdminRequest(deps: {
    accessRequests: AccessRequestRepository;
    notifier: NotificationSender;
}): (requestId: number) => Promise<{
    id: number;
    status: "REJECTED";
}>;
//# sourceMappingURL=rejectAdminRequest.usecase.d.ts.map