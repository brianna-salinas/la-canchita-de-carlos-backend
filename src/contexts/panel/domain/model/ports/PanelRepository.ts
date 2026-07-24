// El panel es un modelo de lectura (reporting) sobre datos de Bookings/Payments,
// no un aggregate propio: expone consultas agregadas para el dashboard del dia (US17-19).
export interface PanelBookingSummary {
  id: number;
  startTime: Date;
  endTime: Date;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: "PENDING" | "PARTIAL" | "PAID";
  court: { id: number; name: string };
  customer: { id: number; name: string } | null;
}

export interface PanelRepository {
  getBookingsForDate(date: Date): Promise<PanelBookingSummary[]>;
  getPaidTotalForDate(date: Date): Promise<number>;
  getPendingPaymentsForDate(date: Date): Promise<PanelBookingSummary[]>;
}
