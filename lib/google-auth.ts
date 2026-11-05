import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

export type GoogleSession = {
  sub: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
};

function encryptionKey() {
  const secret = process.env.HF_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("HF_AUTH_SECRET must contain at least 32 characters.");
  return createHash("sha256").update(secret).digest();
}

export function sealGoogleSession(session: GoogleSession) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(session), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function openGoogleSession(value?: string): GoogleSession | null {
  if (!value) return null;
  try {
    const data = Buffer.from(value, "base64url");
    if (data.length < 29) return null;
    const iv = data.subarray(0, 12);
    const tag = data.subarray(12, 28);
    const encrypted = data.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
    decipher.setAuthTag(tag);
    const decoded = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
    const value = JSON.parse(decoded) as GoogleSession;
    if (!value.sub || !value.email || !value.accessToken || !Number.isFinite(value.expiresAt)) return null;
    return value;
  } catch { return null; }
}

export function readGoogleSession(request: NextRequest) {
  return openGoogleSession(request.cookies.get("hf-google-session")?.value);
}

export function setGoogleSessionCookie(response: NextResponse, session: GoogleSession) {
  response.cookies.set("hf-google-session", sealGoogleSession(session), {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: 60 * 60 * 24 * 30
  });
}

export function clearGoogleSessionCookie(response: NextResponse) {
  response.cookies.set("hf-google-session", "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: 0
  });
}

export async function refreshGoogleSession(session: GoogleSession): Promise<GoogleSession | null> {
  if (session.expiresAt > Date.now() + 60_000) return session;
  if (!session.refreshToken || !process.env.HF_GOOGLE_CLIENT_ID || !process.env.HF_GOOGLE_CLIENT_SECRET) return null;
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", cache: "no-store",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.HF_GOOGLE_CLIENT_ID,
        client_secret: process.env.HF_GOOGLE_CLIENT_SECRET,
        refresh_token: session.refreshToken,
        grant_type: "refresh_token"
      })
    });
    if (!response.ok) return null;
    const tokens = await response.json();
    if (!tokens.access_token) return null;
    return { ...session, accessToken: tokens.access_token, expiresAt: Date.now() + Number(tokens.expires_in || 3600) * 1000 };
  } catch { return null; }
}

export function googleRedirectUri(origin: string) {
  return new URL("/api/auth/google/callback", process.env.NEXT_PUBLIC_APP_URL || origin).toString();
}

export function oauthCookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 600 };
}
