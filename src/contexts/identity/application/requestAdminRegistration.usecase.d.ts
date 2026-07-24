import type { UserRepository } from "../domain/ports/UserRepository.js";
import type { AccessRequestRepository } from "../domain/ports/AccessRequestRepository.js";
import type { NotificationSender } from "../../notifications/application/ports/NotificationSender.js";
export interface RequestAdminRegistrationInput {
    name: string;
    email: string;
    phone?: string;
    password: string;
}
export declare function makeRequestAdminRegistration(deps: {
    users: UserRepository;
    accessRequests: AccessRequestRepository;
    notifier: NotificationSender;
}): (input: RequestAdminRegistrationInput) => Promise<{
    id: number;
    status: import("../domain/model/AccessRequest.js").AccessRequestStatus;
}>;
//# sourceMappingURL=requestAdminRegistration.usecase.d.ts.map