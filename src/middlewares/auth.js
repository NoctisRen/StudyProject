const { verifyToken, extractToken } = require('../config/jwt');

/**
 * JWT 认证中间件
 * 验证请求中的 Bearer Token，并将用户信息挂载到 req.user
 */
const authenticateJWT = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        title: 'Unauthorized',
        status: 401,
        message: 'No token provided',
      });
    }

    const decoded = verifyToken(token);

    // 将用户信息挂载到请求对象
    req.user = {
      id: decoded.sub,
      username: decoded.username,
      roles: decoded.authorities,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: error.message,
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your session has expired. Please login again.',
      });
    }
    next(error);
  }
};

/**
 * 角色授权中间件
 * @param {...string} requiredRoles - 需要的角色列表
 */
const authorize = (...requiredRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const userRoles = req.user.roles || [];
  const hasRole = requiredRoles.some((role) => userRoles.includes(role));

  if (!hasRole) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have the required permissions',
    });
  }

  next();
};

module.exports = {
  authenticateJWT,
  authorize,
};
