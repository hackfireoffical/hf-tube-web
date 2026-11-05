import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { googleRedirectUri, oauthCookieOptions } from "@/lib/google-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const clientId = process.env.HF_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.HF_GOOGLE_CLIENT_SECRET;
  const authSecret = process.env.HF_AUTH_SECRET;
  if (!clientId || !clientSecret || !authSecret || authSecret.length < 32) {
    return NextResponse.redirect(new URL("/settings?google=not-configured", request.url));
  }
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: googleRedirectUri(request.nextUrl.origin),
    response_type: "code",
    scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly",
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    access_type: "offline",
    include_granted_scopes: "true",
    prompt: "consent select_account"
  }).toString();
  const response = NextResponse.redirect(url);
  response.cookies.set("hf-google-oauth-state", state, oauthCookieOptions());
  response.cookies.set("hf-google-pkce", verifier, oauthCookieOptions());
  return response;
}
