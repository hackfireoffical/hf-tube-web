import { NextRequest, NextResponse } from "next/server";
import { invidious } from "@/lib/invidious";
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const page = Math.max(1, Math.min(50, Number(request.nextUrl.searchParams.get("page") || 1)));
  const sort = request.nextUrl.searchParams.get("sort") || "relevance";
  if (!q) return NextResponse.json({ results: [], error: "Enter a search term." }, { status: 400 });
  const allowed = new Set(["relevance", "rating", "upload_date", "view_count"]);
  const sortBy = allowed.has(sort) ? sort : "relevance";
  try {
    const path = "/api/v1/search?q=" + encodeURIComponent(q) + "&type=video&page=" + page + "&sort_by=" + sortBy;
    const result = await invidious<any[]>(path);
    return NextResponse.json({ results: result.data, instance: result.instance, page });
  } catch (error) {
    return NextResponse.json({ results: [], error: error instanceof Error ? error.message : "Search failed." }, { status: 503 });
  }
}