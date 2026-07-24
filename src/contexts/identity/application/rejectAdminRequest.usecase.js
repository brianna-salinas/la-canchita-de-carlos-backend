import { assertPending } from "../domain/model/AccessRequest.js";
import { HttpError } from "../../../platform/errors/HttpError.js";
// TS05 / US21 — rechazar una solicitud pendiente (solo dueno).
export function makeRejectAdminRequest(deps) {
    return async function rejectAdminRequest(requestId) {
        const request = await deps.accessRequests.findByIdOrThrow(requestId);
        try {
            assertPending(request);
        }
        catch (e) {
            throw new HttpError(409, e.message);
        }
        await deps.accessRequests.markRejected(requestId);
        await deps.notifier.sendAdminDecision({ to: request.email, name: request.name, approved: false });
        return { id: request.id, status: "REJECTED" };
    };
}
//# sourceMappingURL=rejectAdminRequest.usecase.js.map