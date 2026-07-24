export interface AdminSummary {
  id: number;
  email: string;
}

export interface AdminDirectory {
  listOtherActiveAdmins(excludeUserId?: number): Promise<AdminSummary[]>;
  findAdminNameOrThrow(userId: number): Promise<string>;
}
