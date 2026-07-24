import type { NotificationRepository } from "../domain/model/ports/NotificationRepository.js";

export function makeListMyNotifications(deps: { notifications: NotificationRepository }) {
  return function listMyNotifications(userId: number) {
    return deps.notifications.listForUser(userId);
  };
}
