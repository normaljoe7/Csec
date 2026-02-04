const { createRateLimiter } = require("./rate-limit");
const { sanitizePayload } = require("./sanitize");
const { maskSensitive } = require("./mask");
const { requireAuth } = require("./policy");
const { createRequestContext } = require("./request-context");

function buildMiddlewareStack({ alertSink }) {
  const rateLimit = createRateLimiter({ alertSink });

  return [
    createRequestContext(),
    rateLimit,
    sanitizePayload({ alertSink }),
    requireAuth({ alertSink }),
    maskSensitive({ alertSink }),
  ];
}

module.exports = {
  buildMiddlewareStack,
};
