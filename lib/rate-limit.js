/**
 * Rate Limiter modeled after NEETEL-AUTOSPARES lib/rate-limit.ts
 * Defends authentication endpoints against brute-force attacks and abuse.
 */

const memoryStore = new Map();

// Periodic garbage collection for expired window records
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryStore.entries()) {
      if (now > value.resetAt) {
        memoryStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export async function checkRateLimit(
  identifier,
  options = { limit: 5, windowMs: 60 * 1000 }
) {
  const now = Date.now();
  const record = memoryStore.get(identifier);

  if (!record || now > record.resetAt) {
    memoryStore.set(identifier, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      reset: now + options.windowMs,
    };
  }

  if (record.count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      reset: record.resetAt,
    };
  }

  record.count += 1;
  memoryStore.set(identifier, record);

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.count,
    reset: record.resetAt,
  };
}

export function getClientIp(req) {
  if (!req || !req.headers) return '127.0.0.1';
  const xff = req.headers.get ? req.headers.get('x-forwarded-for') : req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  const realIp = req.headers.get ? req.headers.get('x-real-ip') : req.headers['x-real-ip'];
  if (realIp) return String(realIp).trim();
  return '127.0.0.1';
}
