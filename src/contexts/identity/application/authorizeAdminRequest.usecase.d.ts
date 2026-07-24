import type { UserRepository } from "../domain/ports/UserRepository.js";
import type { AccessRequestRepository } from "../domain/ports/AccessRequestRepository.js";
import type { EmailVerificationTokenRepository } from "../domain/ports/EmailVerificationTokenRepository.js";
import type { NotificationSender } from "../../notifications/application/ports/NotificationSender.js";
export declare function makeAuthorizeAdminRequest(deps: {
    users: UserRepository;
    accessRequests: AccessRequestRepository;
    emailVerificationTokens: EmailVerificationTokenRepository;
    notifier: NotificationSender;
}): (requestId: number) => Promise<{
    id: number;
    status: import("../domain/model/User.js").UserStatus;
}>;
//# sourceMappingURL=authorizeAdminRequest.usecase.d.ts.map