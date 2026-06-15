const httpMocks = require('node-mocks-http');

// 由于 errorHandler 是 CommonJS 模块，使用 require
const { notFound, errorHandler } = require('../../src/middlewares');

/**
 * 创建一个模拟的 Express req/res/next
 */
function mockReqRes() {
  const req = httpMocks.createRequest();
  const res = httpMocks.createResponse();
  const next = jest.fn();
  return { req, res, next };
}

describe('错误处理中间件', () => {
  describe('notFound()', () => {
    it('应设置 404 状态码', () => {
      const { req, res, next } = mockReqRes();
      notFound(req, res, next);
      expect(res.statusCode).toBe(404);
    });

    it('应调用 next() 传入 Error 对象', () => {
      const { req, res, next } = mockReqRes();
      notFound(req, res, next);
      expect(next).toHaveBeenCalled();
      const error = next.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(404);
    });
  });

  describe('errorHandler()', () => {
    it('基本错误应返回 500 和错误消息', () => {
      const { req, res, next } = mockReqRes();
      const err = new Error('Something went wrong');
      errorHandler(err, req, res, next);
      expect(res.statusCode).toBe(500);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Internal Server Error');
      expect(data.message).toBe('Something went wrong');
      // 非生产环境应包含堆栈
      expect(data.stack).toBeDefined();
    });

    it('应使用 err.statusCode 指定的状态码', () => {
      const { req, res, next } = mockReqRes();
      const err = new Error('Custom error');
      err.statusCode = 429;
      errorHandler(err, req, res, next);
      expect(res.statusCode).toBe(429);
    });

    it('Joi 风格的验证错误应返回 400', () => {
      const { req, res, next } = mockReqRes();
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.details = [{ message: 'Name is required' }];
      err.isJoi = true;
      errorHandler(err, req, res, next);
      expect(res.statusCode).toBe(400);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Validation error');
      expect(data.message).toBe('Name is required');
    });

    it('MongoDB 网络错误应返回 503', () => {
      const { req, res, next } = mockReqRes();
      const err = new Error('getaddrinfo ENOTFOUND');
      err.name = 'MongoNetworkError';
      errorHandler(err, req, res, next);
      expect(res.statusCode).toBe(503);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Database error');
      expect(data.message).toBe('Database is currently unavailable');
    });

    it('MongoError 应返回 503', () => {
      const { req, res, next } = mockReqRes();
      const err = new Error('Authentication failed');
      err.name = 'MongoError';
      err.statusCode = 503;
      errorHandler(err, req, res, next);
      expect(res.statusCode).toBe(503);
      const data = JSON.parse(res._getData());
      expect(data.error).toBe('Database error');
    });

    it('500+ 错误应输出 console.error', () => {
      const { req, res, next } = mockReqRes();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const err = new Error('Server crash');
      errorHandler(err, req, res, next);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('4xx 错误不应输出 console.error', () => {
      const { req, res, next } = mockReqRes();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const err = new Error('Bad request');
      err.statusCode = 400;
      errorHandler(err, req, res, next);
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
