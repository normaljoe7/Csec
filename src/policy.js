const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function requireAuth({ alertSink }) {
  return function authMiddleware(req, res, next) {
    if (SAFE_METHODS.has(req.method)) {
      return next();
    }

    const authHeader = req.headers.authorization;
    const sessionCookie = req.headers.cookie && req.headers.cookie.includes("securelayer_session=");

    if (!authHeader && !sessionCookie) {
      alertSink.warn("Someone tried to change data without signing in. We blocked it.", {
        requestId: req.secureLayer?.requestId,
        path: req.path,
        method: req.method,
      });
      res.status(401).json({
        message: "SecureLayer blocked this request because sign-in is required.",
      });
      return;
    }

    return next();
  };
}

module.exports = {
  requireAuth,
};
