import type { Video } from "@/lib/types";

export type SavedPlaylistVideo = Pick<Video, "videoId" | "title" | "author" | "authorId" | "videoThumbnails" | "lengthSeconds" | "viewCount">;
export type LocalPlaylist = { id: string; name: string; createdAt: number; videos: SavedPlaylistVideo[] };
const KEY = "hf-playlists";
export function readPlaylists(): LocalPlaylist[] {
  if (typeof window === "undefined") return [];
  try { const value = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(value) ? value : []; } catch { return []; }
}
export function writePlaylists(items: LocalPlaylist[]) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(items));
}
export function createPlaylist(name: string): LocalPlaylist | null {
  const clean = name.trim(); if (!clean) return null;
  const items = readPlaylists(); const item = { id: `pl-${Date.now().toString(36)}`, name: clean, createdAt: Date.now(), videos: [] };
  writePlaylists([item, ...items]); return item;
}
export function addVideoToPlaylist(id: string, video: SavedPlaylistVideo) {
  writePlaylists(readPlaylists().map(p => p.id === id && !p.videos.some(v => v.videoId === video.videoId) ? { ...p, videos: [...p.videos, video] } : p));
}
export function removeVideoFromPlaylist(id: string, videoId: string) {
  writePlaylists(readPlaylists().map(p => p.id === id ? { ...p, videos: p.videos.filter(v => v.videoId !== videoId) } : p));
}
export function deletePlaylist(id: string) { writePlaylists(readPlaylists().filter(p => p.id !== id)); }
