export interface AdminSummary {
  id: number;
  email: string;
}

// Puerto minimo de solo-lectura hacia el bounded context Identity: Bookings necesita
// saber a quien avisar cuando se registra una reserva, sin acoplarse al UserRepository
export interface AdminDirectory {
  listOtherActiveAdmins(excludeUserId?: number): Promise<AdminSummary[]>;
  findAdminNameOrThrow(userId: number): Promise<string>;
}
