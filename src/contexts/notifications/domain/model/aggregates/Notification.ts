// Entidad de dominio pura del aggregate Notification (bounded context Notifications):
// notificacion in-app persistida, distinta del correo (eso es NotificationSender).
export type NotificationType =
  | "ACCESS_REQUEST"
  | "PAYMENT_PENDING"
  | "NEW_BOOKING"
  | "BOOKING_CANCELLED"
  | "COURT_MAINTENANCE"
  | "GENERAL";

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message?: string | null;
  linkUrl?: string | null;
  read: boolean;
  createdAt: Date;
}
