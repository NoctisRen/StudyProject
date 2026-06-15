const jwt = require('jsonwebtoken');

// JHipster 风格配置
const jwtConfig = {
  // 生产环境必须使用强密钥，建议从环境变量读取
  secret: process.env.JWT_SECRET || 'your-base64-encoded-secret-key-change-in-production',
  // Token 有效期（秒）- JHipster 默认 24 小时
  expiresIn: 24 * 60 * 60,
  // Token 签发者
  issuer: 'your-app-name',
  // Token 受众
  audience: 'your-app-api',
};

/**
 * 生成 JWT Token（JHipster 风格）
 * @param {Object} user - 用户对象
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  // JHipster 风格的 payload 结构
  const payload = {
    sub: user._id.toString(), // subject = 用户ID
    username: user.username, // JHipster 使用 login，这里用 username
    authorities: user.roles || ['ROLE_USER'], // 用户角色
    iat: Math.floor(Date.now() / 1000), // 签发时间
  };

  return jwt.sign(payload, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
    algorithm: 'HS256', // JHipster 默认使用 HS256
  });
};

/**
 * 验证 Token（Express 中间件使用）
 * @param {String} token - JWT token
 * @returns {Object} 解码后的 payload
 */
const verifyToken = (token) => jwt.verify(token, jwtConfig.secret, {
  issuer: jwtConfig.issuer,
  audience: jwtConfig.audience,
  algorithms: ['HS256'],
});

/**
 * 从请求头提取 Token
 * @param {Object} req - Express 请求对象
 * @returns {String|null} Token 或 null
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // 去掉 'Bearer ' 前缀
  }
  return null;
};

module.exports = {
  jwtConfig,
  generateToken,
  verifyToken,
  extractToken,
};
