export type Subscription = { authorId: string; author: string; avatar?: string; subscribedAt: number };
const KEY = "hf-subscriptions";

export function readSubscriptions(): Subscription[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value.filter(item => item && typeof item.authorId === "string") : [];
  } catch {
    return [];
  }
}

export function saveSubscriptions(items: Subscription[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function isSubscribed(authorId: string) {
  return readSubscriptions().some(item => item.authorId === authorId);
}

export function toggleSubscription(item: Omit<Subscription, "subscribedAt">) {
  const current = readSubscriptions();
  const exists = current.some(entry => entry.authorId === item.authorId);
  const next = exists ? current.filter(entry => entry.authorId !== item.authorId) : [{ ...item, subscribedAt: Date.now() }, ...current];
  saveSubscriptions(next);
  return !exists;
}
