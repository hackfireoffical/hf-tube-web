const PIPED_APIS = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.leptons.xyz",
  "https://pipedapi.nosebs.ru",
  "https://piped-api.privacy.com.de",
  "https://pipedapi.adminforge.de",
  "https://api.piped.yt",
  "https://pipedapi.owo.si"
];

type PipedStream = {
  title?: string;
  uploader?: string;
  uploaderUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  views?: number;
  uploadDate?: string;
  videoStreams?: Array<{
    url?: string;
    mimeType?: string;
    format?: string;
    quality?: string;
    qualityLabel?: string;
    width?: number;
    height?: number;
    bitrate?: number;
    contentLength?: number;
    videoOnly?: boolean;
  }>;
};

export async function getPipedVideo(videoId: string) {
  const controller = new AbortController();
  const attempts = PIPED_APIS.map(async api => {
    const response = await fetch(api + "/streams/" + encodeURIComponent(videoId), {
      headers: { "User-Agent": "HF-Tube/0.6 (community frontend)" },
      cache: "no-store",
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)])
    });
    if (!response.ok) throw new Error(api + " returned HTTP " + response.status);
    const data = await response.json() as PipedStream;
    const streams = (data.videoStreams || []).filter(s => s.url && !s.videoOnly);
    if (!streams.length) throw new Error(api + " returned no combined video/audio streams");
    const formatStreams = streams.map(s => ({
      url: s.url!,
      type: s.mimeType || (s.format === "MPEG_4" ? "video/mp4" : ""),
      quality: s.quality || s.qualityLabel || "Unknown",
      qualityLabel: s.qualityLabel || s.quality || "Unknown",
      resolution: s.height ? s.height + "p" : "",
      container: s.format === "MPEG_4" ? "mp4" : (s.format || "").toLowerCase(),
      bitrate: s.bitrate,
      contentLength: s.contentLength
    }));
    return {
      instance: api,
      video: {
        videoId,
        title: data.title || "Untitled video",
        author: data.uploader || "Unknown channel",
        authorUrl: data.uploaderUrl,
        lengthSeconds: data.duration || 0,
        viewCount: typeof data.views === "number" ? data.views : undefined,
        publishedText: data.uploadDate || "",
        videoThumbnails: data.thumbnailUrl ? [{quality:"high",url:data.thumbnailUrl}] : [],
        formatStreams
      }
    };
  });
  try {
    const result = await Promise.any(attempts);
    controller.abort();
    return result;
  } catch (error) {
    const reasons = error instanceof AggregateError ? error.errors : [error];
    const messages = reasons.map(reason => reason instanceof Error ? reason.message : "Request failed");
    throw new Error("Piped fallback failed. " + messages.join("; "));
  }
}
