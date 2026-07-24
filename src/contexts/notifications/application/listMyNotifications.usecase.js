export function makeListMyNotifications(deps) {
    return function listMyNotifications(userId) {
        return deps.notifications.listForUser(userId);
    };
}
//# sourceMappingURL=listMyNotifications.usecase.js.map