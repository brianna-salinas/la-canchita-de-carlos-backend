

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

  sendPasswordReset(params: { to: string; name: string; rawToken: string }): Promise<void>;

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
