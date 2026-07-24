import type { AccessRequestRepository } from "../domain/model/ports/AccessRequestRepository.js";

export function makeListPendingRequests(deps: { accessRequests: AccessRequestRepository }) {
  return function listPendingRequests() {
    return deps.accessRequests.listPending();
  };
}
