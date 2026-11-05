import { NextRequest, NextResponse } from "next/server";
import { clearGoogleSessionCookie, readGoogleSession, refreshGoogleSession, setGoogleSessionCookie } from "@/lib/google-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = readGoogleSession(request);
  if (!session) return NextResponse.json({ connected: false }, { status: 401 });
  const fresh = await refreshGoogleSession(session);
  if (!fresh) {
    const response = NextResponse.json({ connected: false, error: "Reconnect your Google account." }, { status: 401 });
    clearGoogleSessionCookie(response);
    return response;
  }
  const response = NextResponse.json({ connected: true, account: { email: fresh.email, name: fresh.name, picture: fresh.picture } });
  if (fresh.accessToken !== session.accessToken) setGoogleSessionCookie(response, fresh);
  return response;
}
