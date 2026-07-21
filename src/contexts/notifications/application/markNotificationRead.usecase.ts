import type { NotificationRepository } from "../domain/ports/NotificationRepository.js";

export function makeMarkNotificationRead(deps: { notifications: NotificationRepository }) {
  return function markNotificationRead(notificationId: number) {
    return deps.notifications.markRead(notificationId);
  };
}
