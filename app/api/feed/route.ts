import { NextResponse } from "next/server";
const FALLBACKS = [
  "https://inv.nadeko.net",
  "https://invidious.nerdvpn.de",
  "https://invidious.privacyredirect.com"
];
export const revalidate = 120;
export async function GET() {
  const configured = (process.env.INVIDIOUS_INSTANCES || "").split(",").map(x => x.trim()).filter(Boolean);
  const instances = [...configured, ...FALLBACKS];
  const errors: string[] = [];
  for (const base of [...new Set(instances)]) {
    try {
      const response = await fetch(base.replace(/\/$/, "") + "/api/v1/trending", {
        headers: { "User-Agent": "HF-Tube/0.1 (+https://github.com/hackfireoffical/hf-tube-web)" },
        next: { revalidate: 120 }, signal: AbortSignal.timeout(9000)
      });
      if (!response.ok) { errors.push(base + ": HTTP " + response.status); continue; }
      const data = await response.json();
      if (!Array.isArray(data)) { errors.push(base + ": unexpected API response"); continue; }
      return NextResponse.json({ videos: data, instance: base, fallback: base !== instances[0] });
    } catch (error) { errors.push(base + ": " + (error instanceof Error ? error.message : "request failed")); }
  }
  return NextResponse.json({ videos: [], error: "No available Invidious instance responded.", details: errors }, { status: 503 });
}