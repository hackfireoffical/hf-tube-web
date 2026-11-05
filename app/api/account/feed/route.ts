import { NextRequest, NextResponse } from "next/server";
import { clearGoogleSessionCookie, readGoogleSession, refreshGoogleSession, setGoogleSessionCookie } from "@/lib/google-auth";

export const runtime = "nodejs";

async function youtube(path: string, accessToken: string) {
  const response = await fetch("https://www.googleapis.com/youtube/v3/" + path, {
    headers: { Authorization: "Bearer " + accessToken },
    cache: "no-store"
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "YouTube API request failed.");
  return data;
}

function durationSeconds(value?: string) {
  if (!value) return 0;
  const match = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return 0;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

async function inBatches<T, R>(items: T[], size: number, task: (item: T) => Promise<R>) {
  const output: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const batch = await Promise.all(items.slice(i, i + size).map(task));
    output.push(...batch);
  }
  return output;
}

export async function GET(request: NextRequest) {
  const session = readGoogleSession(request);
  if (!session) return NextResponse.json({ error: "Connect your Google account first." }, { status: 401 });
  const fresh = await refreshGoogleSession(session);
  if (!fresh) {
    const response = NextResponse.json({ error: "Your Google session expired. Reconnect your account." }, { status: 401 });
    clearGoogleSessionCookie(response);
    return response;
  }

  try {
    const subscriptions = await youtube("subscriptions?part=snippet&mine=true&maxResults=30", fresh.accessToken);
    const subscriptionItems = Array.isArray(subscriptions.items) ? subscriptions.items : [];
    const allChannelIds = subscriptionItems.map((item: any) => item.snippet?.resourceId?.channelId).filter(Boolean);\n    const channelIds = allChannelIds.slice(0, 30);
    const channelDetails = channelIds.length
      ? await youtube("channels?part=snippet,contentDetails&id=" + encodeURIComponent(channelIds.join(",")), fresh.accessToken)
      : { items: [] };
    const channels = (channelDetails.items || []).map((channel: any) => ({
      authorId: channel.id,
      author: channel.snippet?.title || "YouTube channel",
      avatar: channel.snippet?.thumbnails?.default?.url || "",
      uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads || ""
    }));
    const activeChannels = channels.filter((channel: any) => channel.uploadsPlaylistId);
    const uploadResults = await inBatches(activeChannels, 10, async (channel: any) => {
      try {
        const result = await youtube("playlistItems?part=snippet,contentDetails&playlistId=" + encodeURIComponent(channel.uploadsPlaylistId) + "&maxResults=5", fresh.accessToken);
        return (result.items || []).map((item: any) => ({
          videoId: item.contentDetails?.videoId || item.snippet?.resourceId?.videoId,
          title: item.snippet?.title || "Untitled video",
          author: item.snippet?.videoOwnerChannelTitle || channel.author,
          authorId: item.snippet?.videoOwnerChannelId || channel.authorId,
          publishedAt: item.contentDetails?.videoPublishedAt || item.snippet?.publishedAt
        })).filter((item: any) => item.videoId);
      } catch { return []; }
    });
    const uploadItems = uploadResults.flat().slice(0, 250);
    const videoIds = Array.from(new Set(uploadItems.map((item: any) => item.videoId)));
    const videoDetails = await inBatches(
      Array.from({ length: Math.ceil(videoIds.length / 50) }, (_, i) => videoIds.slice(i * 50, (i + 1) * 50)),
      1,
      async ids => ids.length ? youtube("videos?part=snippet,contentDetails,statistics&id=" + encodeURIComponent(ids.join(",")), fresh.accessToken) : { items: [] }
    );
    const details = new Map<string, any>();
    for (const group of videoDetails) for (const item of group.items || []) details.set(item.id, item);
    const videos = uploadItems.map((item: any) => {
      const detail = details.get(item.videoId);
      const snippet = detail?.snippet || {};
      const thumbs = snippet.thumbnails || {};
      const image = thumbs.maxres?.url || thumbs.high?.url || thumbs.medium?.url || thumbs.default?.url || "";
      return {
        videoId: item.videoId,
        title: snippet.title || item.title,
        author: snippet.channelTitle || item.author,
        authorId: snippet.channelId || item.authorId,
        videoThumbnails: image ? [{ quality: "high", url: image }] : [],
        lengthSeconds: durationSeconds(detail?.contentDetails?.duration),
        viewCount: Number(detail?.statistics?.viewCount || 0),
        publishedText: snippet.publishedAt ? new Date(snippet.publishedAt).toLocaleDateString() : "",
        description: snippet.description || ""
      };
    }).sort((a: any, b: any) => {
      const ad = details.get(a.videoId)?.snippet?.publishedAt || "";
      const bd = details.get(b.videoId)?.snippet?.publishedAt || "";
      return bd.localeCompare(ad);
    });

    const response = NextResponse.json({
      source: "google-subscriptions",
      account: { email: fresh.email, name: fresh.name, picture: fresh.picture },
      channels: channels.map(({ authorId, author, avatar }: any) => ({ authorId, author, avatar })),
      videos,
      nextPageToken: subscriptions.nextPageToken || null,\n      limitedToFirst30Channels: allChannelIds.length > 30
    });
    if (fresh.accessToken !== session.accessToken) setGoogleSessionCookie(response, fresh);
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load your YouTube subscriptions.";
    const response = NextResponse.json({ error: message }, { status: 502 });
    if (fresh.accessToken !== session.accessToken) setGoogleSessionCookie(response, fresh);
    return response;
  }
}
