/**
 * Express middleware for request logging
 */
function loggerMiddleware(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] HTTP ${req.method} -> ${req.originalUrl}`);
  next();
}

module.exports = loggerMiddleware;
