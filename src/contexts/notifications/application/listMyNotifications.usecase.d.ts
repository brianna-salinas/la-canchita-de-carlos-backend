import type { NotificationRepository } from "../domain/ports/NotificationRepository.js";
export declare function makeListMyNotifications(deps: {
    notifications: NotificationRepository;
}): (userId: number) => Promise<import("../domain/model/Notification.js").Notification[]>;
//# sourceMappingURL=listMyNotifications.usecase.d.ts.map