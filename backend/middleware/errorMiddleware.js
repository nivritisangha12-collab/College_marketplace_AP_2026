/**
 * Global Express error handling middleware
 */
function errorMiddleware(err, req, res, next) {
  console.error('[SERVER ERROR]', err);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the backend.',
    timestamp: new Date().toISOString()
  });
}

module.exports = errorMiddleware;
