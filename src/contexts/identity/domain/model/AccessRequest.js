export function assertPending(request) {
    if (request.status !== "PENDING") {
        throw new Error("Esta solicitud ya fue resuelta.");
    }
}
//# sourceMappingURL=AccessRequest.js.map