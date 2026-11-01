import crypto from "node:crypto";
import { cookies } from "next/headers";
import { findUserById, type DbUser } from "@/lib/db";

export const SESSION_COOKIE_NAME = "resourcex_session";

/**
 * Resolves the server-side JWT cryptographic secret from the environment.
 * Strict security requirement: Fails immediately and securely if missing or empty.
 * Never uses a predictable, hardcoded, or default secret.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error(
      "SECURITY_FATAL: JWT_SECRET environment variable is not defined or is empty. A cryptographically secure secret must be provided via environment variables."
    );
  }
  return secret.trim();
}

export interface UserSessionPayload {
  userId: string;
  email: string;
  role: "borrower" | "owner" | "admin";
  fullName: string;
  iat?: number;
  exp?: number;
}

export interface SanitizedUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: "borrower" | "owner" | "admin";
  avatar: string;
  verified: boolean;
  status: "active" | "suspended" | "pending";
  createdAt: string;
  updatedAt: string;
}

export function sanitizeUser(user: DbUser): SanitizedUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar || "/placeholder-user.jpg",
    verified: Boolean(user.verified),
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// 1. Password Hashing with Scrypt & Cryptographic Salt
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const parts = storedHash.split(":");
    if (parts.length !== 2) return false;
    const [salt, key] = parts;
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

// 2. Standard Cryptographic JWT Implementation (HMAC-SHA256)
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

export function signJwt(payload: UserSessionPayload, expiresInHours = 24): string {
  const secret = getJwtSecret();
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInHours * 3600;

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const fullPayload = {
    ...payload,
    iat: now,
    exp,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJwt(token: string): UserSessionPayload | null {
  try {
    const secret = getJwtSecret();
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;

    // Verify signature with timing-safe comparison
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    const sigBuffer = Buffer.from(signature);
    const expectedSigBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedSigBuffer.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as UserSessionPayload;

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// 3. Server-Side Session Extraction
export async function getCurrentUser(): Promise<SanitizedUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const payload = verifyJwt(sessionCookie.value);
    if (!payload || !payload.userId) {
      return null;
    }

    const user = await findUserById(payload.userId);
    if (!user || user.status !== "active") {
      return null;
    }

    return sanitizeUser(user);
  } catch {
    return null;
  }
}

// 4. Server-Side Admin Authorization Helper
export async function requireAdmin(): Promise<SanitizedUser | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return null;
  }
  return user;
}
