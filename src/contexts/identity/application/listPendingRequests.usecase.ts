import type { AccessRequestRepository } from "../domain/model/ports/AccessRequestRepository.js";

// US21 — listado de solicitudes pendientes (panel de solicitudes de acceso, solo dueno).
export function makeListPendingRequests(deps: { accessRequests: AccessRequestRepository }) {
  return function listPendingRequests() {
    return deps.accessRequests.listPending();
  };
}
