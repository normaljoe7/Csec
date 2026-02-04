const unsafePatterns = [/\$\w+/g, /<\s*script/gi, /on\w+=/gi];

function sanitizeValue(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, sanitizeValue(val)])
    );
  }

  if (typeof value === "string") {
    let sanitized = value;
    unsafePatterns.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, "");
    });
    return sanitized.replace(/[<>]/g, "");
  }

  return value;
}

function sanitizePayload({ alertSink }) {
  return function sanitizeMiddleware(req, res, next) {
    const originalBody = req.body;

    if (originalBody) {
      req.body = sanitizeValue(originalBody);
      if (JSON.stringify(originalBody) !== JSON.stringify(req.body)) {
        alertSink.info("We cleaned up a request payload to remove unsafe input.", {
          requestId: req.secureLayer?.requestId,
          path: req.path,
        });
      }
    }

    next();
  };
}

module.exports = {
  sanitizePayload,
};
