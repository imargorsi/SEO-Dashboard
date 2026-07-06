type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

function getBucket(key: string): Bucket {
  const existing = store.get(key);
  if (existing) return existing;
  const bucket = { count: 0, resetAt: 0 };
  store.set(key, bucket);
  return bucket;
}

export function tooManyAttempts(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = getBucket(key);
  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }
  return bucket.count >= maxAttempts;
}

export function hit(key: string, windowMs: number): void {
  const now = Date.now();
  const bucket = getBucket(key);
  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }
  bucket.count += 1;
}

export function clear(key: string): void {
  store.delete(key);
}

export function availableIn(key: string): number {
  const bucket = store.get(key);
  if (!bucket) return 0;
  return Math.max(0, Math.ceil((bucket.resetAt - Date.now()) / 1000));
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "127.0.0.1";
  }
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

export function loginThrottleKey(email: string, ip: string): string {
  return `${email.toLowerCase()}|${ip}`;
}

const LOGIN_WINDOW_MS = 60_000;
const ROUTE_WINDOW_MS = 60_000;

export function ensureLoginNotRateLimited(email: string, ip: string): number | null {
  const key = loginThrottleKey(email, ip);
  if (!tooManyAttempts(key, 5, LOGIN_WINDOW_MS)) return null;
  return availableIn(key);
}

export function recordLoginFailure(email: string, ip: string): void {
  hit(loginThrottleKey(email, ip), LOGIN_WINDOW_MS);
}

export function clearLoginAttempts(email: string, ip: string): void {
  clear(loginThrottleKey(email, ip));
}

export function ensureRouteNotRateLimited(routeKey: string, ip: string, maxAttempts = 6): number | null {
  const key = `route:${routeKey}|${ip}`;
  if (!tooManyAttempts(key, maxAttempts, ROUTE_WINDOW_MS)) return null;
  return availableIn(key);
}

export function recordRouteAttempt(routeKey: string, ip: string): void {
  hit(`route:${routeKey}|${ip}`, ROUTE_WINDOW_MS);
}

export function resetRateLimitStore(): void {
  store.clear();
}
