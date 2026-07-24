import type { User } from "../aggregates/User.js";

export interface NewUserData {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  status: "PENDING_VERIFICATION" | "ACTIVE";
  isOwner?: boolean;
}

export interface UserRepository {
  findByUsernameOrEmail(usernameOrEmail: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByIdOrThrow(userId: number): Promise<User>;
  countOwners(): Promise<number>;
  create(data: NewUserData): Promise<User>;
  promoteToOwner(userId: number): Promise<User>;
  activate(userId: number): Promise<User>;
  deactivate(userId: number): Promise<User>;
  updateLastAccess(userId: number): Promise<void>;
  updateEmail(userId: number, email: string): Promise<User>;
  updatePasswordHash(userId: number, passwordHash: string): Promise<void>;
  updateProfile(userId: number, data: { name?: string; username?: string }): Promise<User>;
  listActiveAdmins(): Promise<Pick<User, "id" | "name" | "email" | "isOwner" | "lastAccess" | "photoUrl">[]>;
  listOwnerEmails(): Promise<string[]>;
  updatePhoto(userId: number, photoUrl: string | null): Promise<User>;
  // Reautoriza una cuenta previamente desactivada (mismo id/email/username, se
  // conserva su historial) en vez de crear una fila nueva — usado cuando una
  // solicitud de acceso llega con el correo de un usuario en estado INACTIVE.
  reactivate(userId: number, data: { name: string; passwordHash: string }): Promise<User>;
}
