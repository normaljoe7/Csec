function createAlertSink() {
  return {
    info(message, context = {}) {
      console.log(`[SecureLayer] ${message}`, context);
    },
    warn(message, context = {}) {
      console.warn(`[SecureLayer] ${message}`, context);
    },
  };
}

module.exports = {
  createAlertSink,
};
