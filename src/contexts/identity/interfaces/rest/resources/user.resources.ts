import type { User } from "../../../domain/model/aggregates/User.js";

export type UserResource = Omit<User, "passwordHash">;

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface UpdateOwnEmailRequest {
  email: string;
}

export interface ChangeOwnPasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateOwnProfileRequest {
  name?: string;
  username?: string;
}

export interface RequestAdminRegistrationRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
}
