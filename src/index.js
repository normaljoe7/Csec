const { buildMiddlewareStack } = require("./middleware");
const { createAlertSink } = require("./telemetry");

function protect(app) {
  if (!app || typeof app.use !== "function") {
    throw new Error("SecureLayer protect() expects an Express-compatible app instance.");
  }

  const alertSink = createAlertSink();
  const middlewares = buildMiddlewareStack({ alertSink });

  middlewares.forEach((middleware) => app.use(middleware));

  return app;
}

module.exports = {
  protect,
};
