import type { VideoFormat } from "@/lib/types";

export type FormatSizeInfo = { label: string; source: "provider" | "estimate" | "unknown" };

export function formatSizeInfo(format: VideoFormat, durationSeconds = 0): FormatSizeInfo {
  const bytes = Number(format.contentLength || format.clen || 0);
  if (Number.isFinite(bytes) && bytes > 0) {
    return { label: (bytes / 1048576).toFixed(1) + " MB", source: "provider" };
  }
  if (format.size != null && String(format.size).trim()) {
    return { label: String(format.size), source: "provider" };
  }
  const bitrate = Number(format.bitrate || 0);
  if (Number.isFinite(bitrate) && bitrate > 0 && durationSeconds > 0) {
    return { label: "~" + (bitrate * durationSeconds / 8 / 1048576).toFixed(1) + " MB", source: "estimate" };
  }
  return { label: "Size unavailable", source: "unknown" };
}

export function formatQualityLabel(format: VideoFormat): string {
  const quality = format.qualityLabel || format.quality || format.resolution || "Video";
  const mime = format.type || "";
  const container = format.container || mime.split(";")[0].split("/").pop() || "format";
  return quality + " · " + container.toUpperCase();
}
