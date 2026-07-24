export function makeMarkNotificationRead(deps) {
    return function markNotificationRead(notificationId) {
        return deps.notifications.markRead(notificationId);
    };
}
//# sourceMappingURL=markNotificationRead.usecase.js.map