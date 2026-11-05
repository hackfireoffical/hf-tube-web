import { NextRequest, NextResponse } from "next/server";
import { clearGoogleSessionCookie, readGoogleSession } from "@/lib/google-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = readGoogleSession(request);
  if (session?.refreshToken) {
    try {
      await fetch("https://oauth2.googleapis.com/revoke", {
        method: "POST", cache: "no-store",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: session.refreshToken })
      });
    } catch { /* Local session is cleared even if revocation is unavailable. */ }
  }
  const response = NextResponse.json({ disconnected: true });
  clearGoogleSessionCookie(response);
  return response;
}
