class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.details = details;
  }
}

function notFound(req, res, next) {
  next(new AppError(404, 'That route does not exist'));
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    next(err);
    return;
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Something broke on our side' : err.message;

  if (status === 500) {
    console.error(err);
  }

  const body = { error: message };
  if (err.details) body.details = err.details;
  res.status(status).json(body);
}

function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = { AppError, notFound, errorHandler, asyncHandler };
