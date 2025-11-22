import bcrypt from "bcrypt";
import crypto from "crypto";

const SALT_ROUNDS = 10;
const RESET_TOKEN_EXPIRY_HOURS = 1;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getResetTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + RESET_TOKEN_EXPIRY_HOURS);
  return expiry;
}

export function isResetTokenValid(expiry: Date | null): boolean {
  if (!expiry) return false;
  return new Date() < new Date(expiry);
}
