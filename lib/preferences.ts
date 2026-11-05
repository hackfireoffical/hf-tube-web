export type PlaybackPreferences = {
  autoplay: boolean;
  muted: boolean;
  speed: number;
};
export const DEFAULT_PREFERENCES: PlaybackPreferences = { autoplay: true, muted: false, speed: 1 };
const KEY = "hf-playback-preferences";
export function readPreferences(): PlaybackPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!value || typeof value !== "object") return DEFAULT_PREFERENCES;
    const speed = [0.5, 0.75, 1, 1.25, 1.5, 2].includes(Number(value.speed)) ? Number(value.speed) : 1;
    return { autoplay: value.autoplay !== false, muted: value.muted === true, speed };
  } catch { return DEFAULT_PREFERENCES; }
}
export function savePreferences(value: PlaybackPreferences) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(value));
}
