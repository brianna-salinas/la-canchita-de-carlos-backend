import type { AccessRequestRepository } from "../domain/model/ports/AccessRequestRepository.js";
import type { NotificationSender } from "../../notifications/application/ports/NotificationSender.js";
import { assertPending } from "../domain/model/aggregates/AccessRequest.js";
import { HttpError } from "../../../platform/errors/HttpError.js";

export function makeRejectAdminRequest(deps: { accessRequests: AccessRequestRepository; notifier: NotificationSender }) {
  return async function rejectAdminRequest(requestId: number) {
    const request = await deps.accessRequests.findByIdOrThrow(requestId);
    try {
      assertPending(request);
    } catch (e) {
      throw new HttpError(409, (e as Error).message);
    }

    await deps.accessRequests.markRejected(requestId);
    await deps.notifier.sendAdminDecision({ to: request.email, name: request.name, approved: false });

    return { id: request.id, status: "REJECTED" as const };
  };
}
