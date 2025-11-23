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

// Generate a secure random token for password reset
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Hash the reset token before storing in database
export async function hashResetToken(token: string): Promise<string> {
  return await bcrypt.hash(token, SALT_ROUNDS);
}

// Verify the reset token matches the hashed version
export async function verifyResetToken(token: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(token, hash);
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
