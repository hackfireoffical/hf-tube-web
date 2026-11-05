import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { googleRedirectUri, oauthCookieOptions, openGoogleSession, setGoogleSessionCookie, type GoogleSession } from "@/lib/google-auth";

export const runtime = "nodejs";

function fail(request: NextRequest, reason: string) {
  const response = NextResponse.redirect(new URL("/settings?google=" + encodeURIComponent(reason), request.url));
  response.cookies.set("hf-google-oauth-state", "", { ...oauthCookieOptions(), maxAge: 0 });
  response.cookies.set("hf-google-pkce", "", { ...oauthCookieOptions(), maxAge: 0 });
  return response;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state") || "";
  const expectedState = request.cookies.get("hf-google-oauth-state")?.value || "";
  const verifier = request.cookies.get("hf-google-pkce")?.value || "";
  if (!code || !state || !expectedState || !verifier) return fail(request, "oauth-failed");
  const supplied = Buffer.from(state);
  const expected = Buffer.from(expectedState);
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return fail(request, "oauth-failed");
  const clientId = process.env.HF_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.HF_GOOGLE_CLIENT_SECRET;
  const authSecret = process.env.HF_AUTH_SECRET;
  if (!clientId || !clientSecret || !authSecret || authSecret.length < 32) return fail(request, "not-configured");

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", cache: "no-store",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code, client_id: clientId, client_secret: clientSecret,
        redirect_uri: googleRedirectUri(request.nextUrl.origin),
        grant_type: "authorization_code", code_verifier: verifier
      })
    });
    if (!tokenResponse.ok) return fail(request, "token-exchange-failed");
    const tokens = await tokenResponse.json();
    if (!tokens.access_token) return fail(request, "token-exchange-failed");

    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: "Bearer " + tokens.access_token }, cache: "no-store"
    });
    if (!profileResponse.ok) return fail(request, "profile-failed");
    const profile = await profileResponse.json();
    if (!profile.sub || !profile.email) return fail(request, "profile-failed");

    const old = openGoogleSession(request.cookies.get("hf-google-session")?.value);
    const session: GoogleSession = {
      sub: profile.sub,
      email: profile.email,
      name: profile.name || profile.email,
      picture: profile.picture,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || (old?.sub === profile.sub ? old.refreshToken : undefined),
      expiresAt: Date.now() + Number(tokens.expires_in || 3600) * 1000
    };
    const response = NextResponse.redirect(new URL("/subscriptions?google=connected", request.url));
    setGoogleSessionCookie(response, session);
    response.cookies.set("hf-google-oauth-state", "", { ...oauthCookieOptions(), maxAge: 0 });
    response.cookies.set("hf-google-pkce", "", { ...oauthCookieOptions(), maxAge: 0 });
    return response;
  } catch {
    return fail(request, "oauth-failed");
  }
}
