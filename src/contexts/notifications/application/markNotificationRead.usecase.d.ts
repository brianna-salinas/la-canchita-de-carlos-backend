import type { NotificationRepository } from "../domain/ports/NotificationRepository.js";
export declare function makeMarkNotificationRead(deps: {
    notifications: NotificationRepository;
}): (notificationId: number) => Promise<void>;
//# sourceMappingURL=markNotificationRead.usecase.d.ts.map