/* eslint-disable global-require */

/**
 * 测试环境初始化
 *
 * 注意：集成测试依赖 GitHub Actions 的 services.mongo 提供的临时 MongoDB。
 * 本地运行需要手动启动 MongoDB 实例并设置 DB_URL 环境变量。
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../src/db/connection');

/**
 * 创建一个 Express 实例用于测试
 * 不启动 listen，直接交给 supertest 处理
 */
function createTestApp() {
  const app = express();

  // 加载基础中间件
  app.use(require('helmet')());
  app.use(require('body-parser').json());

  // 注册认证路由
  app.use('/api', require('../../src/routes/auth'));
  // 注册员工路由
  app.use('/api/employees', require('../../src/routes/employees'));
  // 注册用户路由
  app.use('/api/users', require('../../src/routes/users'));

  // 错误处理
  app.use(require('../../src/middlewares').notFound);
  app.use(require('../../src/middlewares').errorHandler);

  return app;
}

/**
 * 在测试数据库中插入一条管理员用户
 */
async function seedAdminUser() {
  const users = db.get('user');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const existing = await users.findOne({ username: 'admin' });
  if (!existing) {
    await users.insert({
      username: 'admin',
      password: hashedPassword,
      email: 'admin@test.com',
      roles: ['ROLE_USER', 'ROLE_ADMIN'],
      activated: true,
      langKey: 'en',
      createdBy: 'system',
      createdDate: new Date(),
    });
  }
}

/**
 * 在测试数据库中插入一条普通用户
 */
async function seedRegularUser() {
  const users = db.get('user');
  const hashedPassword = await bcrypt.hash('user123', 10);
  const existing = await users.findOne({ username: 'regularuser' });
  if (!existing) {
    await users.insert({
      username: 'regularuser',
      password: hashedPassword,
      email: 'regular@test.com',
      roles: ['ROLE_USER'],
      activated: true,
      langKey: 'en',
      createdBy: 'system',
      createdDate: new Date(),
    });
  }
}

/**
 * 清理测试数据
 */
async function cleanDatabase() {
  const users = db.get('user');
  const employees = db.get('employees');
  await users.remove({ username: { $in: ['admin', 'regularuser', 'testregister'] } });
  await employees.remove({});
}

module.exports = {
  createTestApp,
  seedAdminUser,
  seedRegularUser,
  cleanDatabase,
};
