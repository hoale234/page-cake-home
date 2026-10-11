const windowMs = 60_000;
const maxRequests = 5;
const requestsByIp = new Map<string, { count: number; resetAt: number }>();

export function checkSubmissionRateLimit(ip: string, now = Date.now()) {
  const current = requestsByIp.get(ip);

  if (!current || current.resetAt <= now) {
    requestsByIp.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of requestsByIp) {
      if (entry.resetAt <= now) requestsByIp.delete(ip);
    }
  }, windowMs).unref();
}
