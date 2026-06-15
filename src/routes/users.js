const express = require('express');
const { ObjectId } = require('mongodb');
const db = require('../db/connection');
const { authenticateJWT, authorize } = require('../middlewares/auth'); // 新增

const users = db.get('user');
const employees = db.get('employees');

const router = express.Router();

// 保护所有用户路由 - 需要认证
router.use(authenticateJWT);

// 1. 获取所有用户 - 需要管理员权限
router.get('/', authorize('ROLE_ADMIN'), async (req, res, next) => {
  try {
    const allUsers = await users.find({}, { projection: { password: 0 } }); // 不返回密码
    res.json(allUsers);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
});

// 2. 获取数据库中所有职位（从 employees 集合）
router.get('/jobs', async (req, res, next) => {
  try {
    const jobs = await employees.distinct('job');
    res.json(jobs);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
});

// 3. 根据 ID 范围获取用户 - 需要管理员权限
router.get('/range', authorize('ROLE_ADMIN'), async (req, res, next) => {
  try {
    const { start, end } = req.query;

    // 验证参数
    if (!start || !end) {
      return res.status(400).json({
        error: 'Please provide both start and end parameters',
      });
    }

    // 验证 ID 格式
    if (!ObjectId.isValid(start) || !ObjectId.isValid(end)) {
      return res.status(400).json({
        error: 'Invalid ID format. IDs must be valid ObjectIds',
      });
    }

    // 查询 ID 范围内的用户
    const usersInRange = await users.find({
      _id: {
        $gte: ObjectId.createFromHexString(start),
        $lte: ObjectId.createFromHexString(end),
      },
    }, { projection: { password: 0 } }); // 不返回密码

    res.json(usersInRange);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
});

// 4. 根据用户名获取用户
router.get('/username/:username', async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await users.findOne({
      username,
    }, { projection: { password: 0 } }); // 不返回密码

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json(user);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
});

// 5. 根据 _id 获取用户（必须放在最后，因为 :id 会匹配所有）
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // 验证 ID 格式
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: 'Invalid ID format. ID must be a valid ObjectId',
      });
    }

    const user = await users.findOne({
      _id: ObjectId.createFromHexString(id),
    }, { projection: { password: 0 } }); // 不返回密码

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json(user);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
});

module.exports = router;
