import { NextRequest, NextResponse } from "next/server";
import { invidious } from "@/lib/invidious";

const QUERIES = ["shorts", "short videos", "minecraft shorts"];

export async function GET(request: NextRequest) {
  const requestedPage = Number(request.nextUrl.searchParams.get("page") || "1");
  const page = Number.isInteger(requestedPage) && requestedPage > 0 && requestedPage <= 20 ? requestedPage : 1;
  try {
    const batches = await Promise.all(QUERIES.map(async q => {
      try {
        const result = await invidious<any[]>("/api/v1/search?q=" + encodeURIComponent(q) + "&type=video&page=" + page + "&sort_by=view_count");
        return { videos: Array.isArray(result.data) ? result.data : [], instance: result.instance };
      } catch {
        return { videos: [], instance: "" };
      }
    }));
    const seen = new Set<string>();
    const videos = batches.flatMap(batch => batch.videos).filter(video => {
      const duration = Number(video.lengthSeconds || 0);
      if (!video.videoId || seen.has(video.videoId) || duration < 1 || duration > 60 || video.liveNow) return false;
      seen.add(video.videoId);
      return true;
    }).slice(0, 24);
    return NextResponse.json({ videos, page, instance: batches.find(batch => batch.instance)?.instance || "" });
  } catch (error) {
    return NextResponse.json({ videos: [], error: error instanceof Error ? error.message : "Short videos unavailable." }, { status: 503 });
  }
}
