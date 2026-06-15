/**
 * 404 中间件 — 匹配所有未捕获的路由
 */
function notFound(req, res, next) {
  res.status(404);
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

/**
 * 全局错误处理中间件
 * 统一处理 Joi 验证错误、MongoDB 错误、自定义错误
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // 默认值
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  let error = 'Internal Server Error';

  // Joi 验证错误
  if (err.isJoi || (err.name && err.name === 'ValidationError' && err.details)) {
    status = 400;
    error = 'Validation error';
    message = err.details[0] ? err.details[0].message : err.message;
  }

  // MongoDB 连接失败 / Monk 错误
  if (err.name === 'MongoNetworkError' || err.name === 'MongoError') {
    status = 503;
    error = 'Database error';
    message = 'Database is currently unavailable';
  }

  res.status(status);

  const payload = { error, message };
  // 生产环境不暴露堆栈
  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  // 如果是服务端错误，打印日志
  if (status >= 500) {
    console.error(`[ERROR] ${status} - ${err.message}`, err.stack);
  }

  res.json(payload);
}

module.exports = {
  notFound,
  errorHandler,
};
