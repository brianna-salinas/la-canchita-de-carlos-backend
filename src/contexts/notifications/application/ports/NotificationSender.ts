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
}
