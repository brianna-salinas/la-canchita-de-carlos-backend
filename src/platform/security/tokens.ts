import { randomBytes, createHash } from "crypto";

export function generateRawToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}

export function tokenExpiryFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
