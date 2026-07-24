// Puerto del bounded context Notifications (generico, RF23/RF24). El adaptador
// concreto (infrastructure/ResendNotificationSender.ts) implementa esto contra Resend;
// un fallo de envio nunca debe propagarse ni bloquear al llamador (por eso todo retorna void).
export interface NotificationSender {
  sendBookingConfirmation(params: {
    to: string;
    customerName: string;
    courtName: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<void>;

  sendAdminDecision(params: { to: string; name: string; approved: boolean }): Promise<void>;

  sendEmailVerification(params: { to: string; name: string; rawToken: string }): Promise<void>;

  // "¿Olvidaste tu contrasena?" — enlace de un solo uso para restablecerla.
  sendPasswordReset(params: { to: string; name: string; rawToken: string }): Promise<void>;

  // RF21 — avisa al/los administrador(es) dueno que llego una solicitud de acceso nueva
  // para revisar, sin que tengan que entrar a chequear manualmente.
  sendNewAccessRequestAlert(params: { to: string; requesterName: string; requesterEmail: string }): Promise<void>;

  sendNewBookingAlert(params: {
    to: string;
    registeredByName: string;
    courtName: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<void>;
}
