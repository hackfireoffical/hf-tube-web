export type Thumbnail = { quality: string; url: string; width?: number; height?: number };
export type Video = {
  type?: string; title: string; videoId: string; author?: string; authorId?: string;
  authorUrl?: string; videoThumbnails?: Thumbnail[]; lengthSeconds?: number;
  viewCount?: number; viewCountText?: string; published?: number; publishedText?: string; liveNow?: boolean; description?: string;
};
export type VideoFormat = {
  url: string; quality?: string; qualityLabel?: string; resolution?: string;
  container?: string; type?: string; bitrate?: number|string;
  contentLength?: number|string; clen?: number|string; size?: string|number;
};
export type VideoDetails = Video & {
  likeCount?: number; subCountText?: string; formatStreams?: VideoFormat[];
  adaptiveFormats?: VideoFormat[];
  recommendedVideos?: Video[];
  captions?: { languageCode?: string; language_code?: string; label: string; url: string }[];
};
export function thumbnail(video: Video) {
  const list = video.videoThumbnails || [];
  return list.find(x => x.quality === "maxres")?.url || list.find(x => x.quality === "high")?.url || list.at(-1)?.url || "";
}
export function formatViews(n?: number, text?: string) {
  if (typeof n === "number" && Number.isFinite(n) && n > 0) {
    return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n) + " views";
  }
  if (n === 0) return "0 views";
  if (text && !/[^\x00-\x7F]/.test(text.trim()) && !/^0\s*(views?)?$/i.test(text.trim())) return text;
  return text ? "No views" : "View count unavailable";
}
export function formatPublished(timestamp?: number, fallback?: string) {
  if (typeof timestamp === "number" && Number.isFinite(timestamp) && timestamp > 0) {
    const milliseconds = timestamp > 1e12 ? timestamp : timestamp * 1000;
    const seconds = Math.max(0, Math.floor((Date.now() - milliseconds) / 1000));
    if (seconds < 45) return "Just now";
    const units: [number, Intl.RelativeTimeFormatUnit][] = [[86400, "day"], [3600, "hour"], [60, "minute"]];
    const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
    for (const [size, unit] of units) if (seconds >= size) return formatter.format(-Math.floor(seconds / size), unit);
    return "Just now";
  }
  if (fallback && !/[^\x00-\x7F]/.test(fallback.trim()) && !/^0\s*seconds? ago$/i.test(fallback.trim())) return fallback;
  return "Date unavailable";
}
export function formatDuration(n?: number) {
  if (!n) return "";
  return [Math.floor(n / 3600), Math.floor((n % 3600) / 60), n % 60].map((v, i) => i === 0 || (i === 1 && n >= 3600) ? String(v).padStart(i ? 2 : 1, "0") : String(v).padStart(2, "0")).join(":");
}
