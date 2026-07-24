
export type UserStatus = "PENDING_VERIFICATION" | "ACTIVE" | "INACTIVE";

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  isOwner: boolean;
  lastAccess?: Date | null;
  photoUrl?: string | null;
}

export function assertCanLogin(user: Pick<User, "status">): void {
  if (user.status === "PENDING_VERIFICATION") {
    throw new Error("Tu cuenta aun no fue verificada. Revisa tu correo para activarla (RF34).");
  }
  if (user.status === "INACTIVE") {
    throw new Error("Esta cuenta esta inactiva.");
  }
}

export function usernameFromEmail(email: string): string {
  return email.split("@")[0] ?? email;
}
