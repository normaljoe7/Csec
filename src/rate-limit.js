const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX = 60;

function createRateLimiter({ alertSink }) {
  const buckets = new Map();

  return function rateLimiter(req, res, next) {
    const now = Date.now();
    const key = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown")
      .toString()
      .split(",")[0]
      .trim();

    const bucket = buckets.get(key) || { count: 0, resetAt: now + DEFAULT_WINDOW_MS };

    if (now > bucket.resetAt) {
      bucket.count = 0;
      bucket.resetAt = now + DEFAULT_WINDOW_MS;
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    res.setHeader("x-securelayer-rate-limit", DEFAULT_MAX);
    res.setHeader("x-securelayer-rate-remaining", Math.max(DEFAULT_MAX - bucket.count, 0));

    if (bucket.count > DEFAULT_MAX) {
      alertSink.warn("We slowed down repeated requests from one source to keep your app safe.", {
        requestId: req.secureLayer?.requestId,
        ip: key,
      });

      res.status(429).json({
        message: "Too many requests. SecureLayer paused this request to protect your app.",
      });
      return;
    }

    next();
  };
}

module.exports = {
  createRateLimiter,
};
