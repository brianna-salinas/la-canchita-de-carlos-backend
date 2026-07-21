import type { User } from "../model/User.js";

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
  updateLastAccess(userId: number): Promise<void>;
  updateEmail(userId: number, email: string): Promise<User>;
  updatePasswordHash(userId: number, passwordHash: string): Promise<void>;
  listActiveAdmins(): Promise<Pick<User, "id" | "name" | "email" | "isOwner" | "lastAccess">[]>;
}
