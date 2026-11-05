const DEFAULT_INSTANCES = [
  "https://inv.nadeko.net",
  "https://invidious.nerdvpn.de",
  "https://invidious.privacyredirect.com"
];
export function getInstances() {
  const configured = (process.env.INVIDIOUS_INSTANCES || "").split(",").map(v => v.trim()).filter(Boolean);
  return [...new Set([...configured, ...DEFAULT_INSTANCES].map(v => v.replace(/\/$/, "")))];
}
export async function invidious<T>(path: string): Promise<{ data: T; instance: string }> {
  const errors: string[] = [];
  for (const instance of getInstances()) {
    try {
      const response = await fetch(instance + path, {
        headers: { "User-Agent": "HF-Tube/0.2 (community frontend)" },
        cache: "no-store",
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) { errors.push(instance + " returned " + response.status); continue; }
      return { data: await response.json() as T, instance };
    } catch (error) {
      errors.push(instance + ": " + (error instanceof Error ? error.message : "request failed"));
    }
  }
  throw new Error("All video sources are unavailable. " + errors.join("; "));
}