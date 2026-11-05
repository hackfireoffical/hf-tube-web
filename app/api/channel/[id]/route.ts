import { NextRequest, NextResponse } from "next/server";
import { invidious } from "@/lib/invidious";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[\w-]{3,100}$/.test(id)) {
    return NextResponse.json({ error: "Invalid channel ID." }, { status: 400 });
  }
  const requestedPage = Number(request.nextUrl.searchParams.get("page") || "1");
  const page = Number.isInteger(requestedPage) && requestedPage > 0 && requestedPage <= 100 ? requestedPage : 1;

  try {
    const channelResult = await invidious<any>("/api/v1/channels/" + encodeURIComponent(id));
    let videos: any[] = [];
    try {
      const videoResult = await invidious<any[]>("/api/v1/channels/" + encodeURIComponent(id) + "/videos?page=" + page);
      videos = Array.isArray(videoResult.data) ? videoResult.data : [];
    } catch {
      if (page === 1) videos = Array.isArray(channelResult.data.latestVideos) ? channelResult.data.latestVideos : [];
    }
    return NextResponse.json({ channel: channelResult.data, videos, page, instance: channelResult.instance });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Channel unavailable." },
      { status: 503 }
    );
  }
}
