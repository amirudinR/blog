type Bucket = {
  hits: number[];
};

const buckets = new Map<string, Bucket>();

const MAX_BUCKETS = 10_000;

export type RateLimitResult = {
  success: boolean;
  remaining: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  if (buckets.size >= MAX_BUCKETS) {
    for (const [bucketKey, bucket] of buckets) {
      if (!bucket.hits.some((hit) => now - hit < windowMs)) {
        buckets.delete(bucketKey);
      }
    }
  }

  const bucket = buckets.get(key);
  const hits = bucket ? bucket.hits.filter((hit) => now - hit < windowMs) : [];

  if (hits.length >= limit) {
    buckets.set(key, { hits });
    return { success: false, remaining: 0 };
  }

  hits.push(now);
  buckets.set(key, { hits });

  return { success: true, remaining: limit - hits.length };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "anonymous";
}
