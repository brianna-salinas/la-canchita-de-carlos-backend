export interface AdminSummary {
  id: number;
  email: string;
}

// Puerto minimo de solo-lectura hacia el bounded context Identity: Bookings necesita
// saber a quien avisar cuando se registra una reserva, sin acoplarse al UserRepository
// completo de Identity (cada context expone solo lo que el otro necesita).
export interface AdminDirectory {
  listOtherActiveAdmins(excludeUserId?: number): Promise<AdminSummary[]>;
  findAdminNameOrThrow(userId: number): Promise<string>;
}
