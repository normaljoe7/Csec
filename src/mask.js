const SENSITIVE_KEYS = ["password", "token", "secret", "apiKey", "api_key", "authorization"];

function maskString(value) {
  const emailMatch = value.match(/([\w.+-]+)@([\w.-]+)/);
  if (emailMatch) {
    return value.replace(emailMatch[1], "***");
  }
  if (value.length > 6) {
    return `${value.slice(0, 2)}***${value.slice(-2)}`;
  }
  return "***";
}

function maskObject(value) {
  if (Array.isArray(value)) {
    return value.map(maskObject);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => {
        if (SENSITIVE_KEYS.includes(key)) {
          return [key, "***"];
        }
        return [key, maskObject(val)];
      })
    );
  }
  if (typeof value === "string") {
    return maskString(value);
  }
  return value;
}

function maskSensitive({ alertSink }) {
  return function maskMiddleware(req, res, next) {
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    res.json = (payload) => {
      const masked = maskObject(payload);
      if (JSON.stringify(payload) !== JSON.stringify(masked)) {
        alertSink.info("We masked sensitive data before it left your app.", {
          requestId: req.secureLayer?.requestId,
          path: req.path,
        });
      }
      return originalJson(masked);
    };

    res.send = (payload) => {
      if (typeof payload === "string") {
        const masked = maskString(payload);
        return originalSend(masked);
      }
      return originalSend(payload);
    };

    next();
  };
}

module.exports = {
  maskSensitive,
};
