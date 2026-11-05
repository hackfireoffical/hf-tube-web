export type Video = {
  type?: string; title: string; videoId: string; author?: string; authorId?: string;
  authorUrl?: string; videoThumbnails?: { quality: string; url: string; width?: number; height?: number }[];
  lengthSeconds?: number; viewCount?: number; publishedText?: string; liveNow?: boolean;
};
export function thumbnail(video: Video) {
  const list = video.videoThumbnails || [];
  return list.find(x => x.quality === "maxres")?.url || list.find(x => x.quality === "high")?.url || list.at(-1)?.url || "";
}
export function formatViews(n?: number) {
  if (!n) return "— views";
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n) + " views";
}
export function formatDuration(n?: number) {
  if (!n) return "";
  return [Math.floor(n / 3600), Math.floor((n % 3600) / 60), n % 60].map((v, i) => i === 0 || (i === 1 && n >= 3600) ? String(v).padStart(i ? 2 : 1, "0") : String(v).padStart(2, "0")).join(":");
}