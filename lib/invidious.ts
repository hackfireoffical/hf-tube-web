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
