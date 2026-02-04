const crypto = require("crypto");

function createRequestContext() {
  return function requestContext(req, res, next) {
    req.secureLayer = {
      requestId: crypto.randomUUID(),
      startedAt: Date.now(),
    };

    res.setHeader("x-securelayer-request-id", req.secureLayer.requestId);
    next();
  };
}

module.exports = {
  createRequestContext,
};
