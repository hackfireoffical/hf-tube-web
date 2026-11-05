const DEFAULT_INSTANCES = [
  "https://invidious.tiekoetter.com",
  "https://invidious.nerdvpn.de",
  "https://yt.chocolatemoo53.com",
  "https://inv.nadeko.net"
];

export function getInstances() {
  const configured = (process.env.INVIDIOUS_INSTANCES || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);
  return [...new Set([...configured, ...DEFAULT_INSTANCES].map(value => value.replace(/\/$/, "")))];
}

export async function invidious<T>(path: string): Promise<{ data: T; instance: string }> {
  const instances = getInstances();
  const controller = new AbortController();
  const attempts = instances.map(async instance => {
    const response = await fetch(instance + path, {
      headers: { "User-Agent": "HF-Tube/0.4 (community frontend)" },
      cache: "no-store",
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(7000)])
    });
    if (!response.ok) throw new Error(instance + " returned HTTP " + response.status);
    const data = await response.json() as T;
    if (data === null || data === undefined) throw new Error(instance + " returned an empty response");
    return { data, instance };
  });

  try {
    // Return as soon as the first instance provides valid JSON; cancel slower requests.
    const result = await Promise.any(attempts);
    controller.abort();
    return result;
  } catch (error) {
    const reasons = error instanceof AggregateError ? error.errors : [error];
    const messages = reasons.map(reason => reason instanceof Error ? reason.message : "Request failed");
    throw new Error("No available Invidious instance responded. " + messages.join("; "));
  }
}


export async function invidiousVideo<T extends { formatStreams?: Array<{ url?: string; type?: string }> }>(path: string): Promise<{ data: T; instance: string }> {
  const instances = getInstances();
  const controller = new AbortController();
  const attempts = instances.map(async instance => {
    const response = await fetch(instance + path, {
      headers: { "User-Agent": "HF-Tube/0.5 (community frontend)" },
      cache: "no-store",
      signal: AbortSignal.any([controller.signal, AbortSignal.timeout(8000)])
    });
    if (!response.ok) throw new Error(instance + " returned HTTP " + response.status);
    const data = await response.json() as T;
    const formats = Array.isArray(data?.formatStreams) ? data.formatStreams.filter(format => typeof format.url === "string" && format.url.length > 0) : [];
    if (!formats.length) throw new Error(instance + " returned video details without playable combined formats");
    return { data, instance };
  });
  try {
    const result = await Promise.any(attempts);
    controller.abort();
    return result;
  } catch (error) {
    const reasons = error instanceof AggregateError ? error.errors : [error];
    const messages = reasons.map(reason => reason instanceof Error ? reason.message : "Request failed");
    throw new Error("No provider returned playable video formats. " + messages.join("; "));
  }
}
