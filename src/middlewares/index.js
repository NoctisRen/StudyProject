function notFound(req, res, next) {
  res.status(404);
  const error = new Error('Not Found', req.originalUrl);
  error.statusCode = 404;
  next(error);
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.statusCode || err.status || res.statusCode || 500;
  res.status(status);

  const payload = { message: err.message };
  // Avoid leaking stack traces in production.
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.json(payload);
}

function timeSign(req, res, next) {
  console.log(new Date().toISOString());
  res.set('Accepted---At', new Date().toISOString());
  next();
}

module.exports = {
  notFound,
  errorHandler,
  timeSign,
};
