import { NextRequest, NextResponse } from "next/server";
import { invidious } from "@/lib/invidious";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() || "";
  if (q.length < 2) return NextResponse.json({ suggestions: [] });
  try {
    const result = await invidious<any>("/api/v1/search/suggestions?q=" + encodeURIComponent(q));
    const raw = Array.isArray(result.data) ? result.data : result.data?.suggestions || [];
    const suggestions = raw.map((item: any) => typeof item === "string" ? item : item?.text || item?.query || "").filter((item: string) => item && item.toLowerCase() !== q.toLowerCase()).slice(0, 8);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] });
  }
}
