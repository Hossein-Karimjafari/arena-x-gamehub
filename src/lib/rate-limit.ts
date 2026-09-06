// Simple in-memory sliding-window rate limiter.
// Sufficient for single-instance deployments; swap for Redis/Upstash in multi-instance prod.

const buckets = new Map<string, number[]>();

// Occasionally clean expired entries so the map does not grow forever.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, times] of buckets) {
    if (times.length === 0 || now - times[times.length - 1] > 3_600_000) buckets.delete(key);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  sweep(now);
  const times = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (times.length >= limit) {
    buckets.set(key, times);
    return false;
  }
  times.push(now);
  buckets.set(key, times);
  return true;
}

export function clientKey(req: Request, scope: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local";
  return `${scope}:${ip}`;
}
