const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/connection');
const { userSchema, loginSchema } = require('../db/schema');
const { generateToken } = require('../config/jwt');
const { authenticateJWT } = require('../middlewares/auth');

const users = db.get('user');
const router = express.Router();

/**
 * 用户注册
 * POST /api/register
 */
router.post('/register', async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    
    // 验证请求数据
    const { error } = userSchema.validate({ username, password, email });
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    // 检查用户名是否已存在
    const existingUser = await users.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        error: 'Username already exists',
        message: 'Please choose a different username'
      });
    }
    
    // 检查邮箱是否已存在
    const existingEmail = await users.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({
        error: 'Email already exists',
        message: 'Please use a different email address'
      });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建新用户
    const newUser = await users.insert({
      username,
      password: hashedPassword,
      email,
      roles: ['ROLE_USER'],
      activated: true,
      langKey: 'en',
      createdBy: username,
      createdDate: new Date()
    });
    
    // 移除密码后返回用户信息
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
    });
    
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
});

/**
 * 用户登录 - JHipster 风格
 * POST /api/authenticate
 */
router.post('/authenticate', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    // 验证请求数据
    const { error } = loginSchema.validate({ username, password });
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    
    // 查找用户
    const user = await users.findOne({ username });
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }
    
    // 检查用户是否激活
    if (user.activated === false) {
      return res.status(401).json({
        error: 'Account not activated',
        message: 'Please activate your account before logging in'
      });
    }
    
    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Username or password is incorrect'
      });
    }
    
    // 生成 JWT Token
    const token = generateToken(user);
    
    // JHipster 标准响应格式
    res.json({
      id_token: token,
      token_type: 'Bearer',
      expires_in: 86400  // 24小时，单位秒
    });
    
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
});

/**
 * 检查认证状态
 * GET /api/authenticate
 */
router.get('/authenticate', authenticateJWT, (req, res) => {
  res.json({
    authenticated: true,
    username: req.user.username
  });
});

/**
 * 获取当前用户账户信息
 * GET /api/account
 */
router.get('/account', authenticateJWT, async (req, res, next) => {
  try {
    const user = await users.findOne(
      { username: req.user.username },
      { projection: { password: 0 } }  // 不返回密码
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // JHipster 风格响应格式
    res.json({
      id: user._id,
      login: user.username,
      username: user.username,
      email: user.email,
      authorities: user.roles || ['ROLE_USER'],
      activated: user.activated !== false,
      langKey: user.langKey || 'en',
      createdBy: user.createdBy || 'system',
      createdDate: user.createdDate,
      lastModifiedBy: user.lastModifiedBy,
      lastModifiedDate: user.lastModifiedDate
    });
    
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
});

module.exports = router;