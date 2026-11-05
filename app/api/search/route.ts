import { NextRequest, NextResponse } from "next/server";
import { invidious } from "@/lib/invidious";
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const page = Math.max(1, Math.min(50, Number(request.nextUrl.searchParams.get("page") || 1)));
  const sort = request.nextUrl.searchParams.get("sort") || "relevance";
  const date = request.nextUrl.searchParams.get("date") || "";
  const duration = request.nextUrl.searchParams.get("duration") || "";
  const type = request.nextUrl.searchParams.get("type") || "video";
  if (!q) return NextResponse.json({ results: [], error: "Enter a search term." }, { status: 400 });
  const allowed = new Set(["relevance", "rating", "upload_date", "view_count"]);
  const sortBy = allowed.has(sort) ? sort : "relevance";
  const allowedDates = new Set(["hour", "today", "week", "month", "year"]);
  const allowedDurations = new Set(["short", "medium", "long"]);
  const dateFilter = allowedDates.has(date) ? date : "";
  const durationFilter = allowedDurations.has(duration) ? duration : "";
  const searchType = type === "channel" ? "channel" : "video";
  try {
    const params = new URLSearchParams({ q, type: searchType, page: String(page), sort_by: sortBy });
    if (dateFilter) params.set("date", dateFilter);
    if (durationFilter) params.set("duration", durationFilter);
    const path = "/api/v1/search?" + params.toString();
    const result = await invidious<any[]>(path);
    return NextResponse.json({ results: result.data, instance: result.instance, page });
  } catch (error) {
    return NextResponse.json({ results: [], error: error instanceof Error ? error.message : "Search failed." }, { status: 503 });
  }
}