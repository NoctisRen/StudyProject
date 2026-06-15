/* eslint-disable global-require, no-plusplus, no-await-in-loop */

/**
 * 测试环境初始化
 *
 * 注意：集成测试依赖 GitHub Actions 的 services.mongo 提供的临时 MongoDB。
 * 本地运行需要手动启动 MongoDB 实例并设置 DB_URL 环境变量。
 */
const MONGO_URL = process.env.DB_URL || 'mongodb://localhost:27017/test-my-employees';

/**
 * 等待 MongoDB 就绪（最多重试 30 次，每次 1s）
 */
async function waitForMongo() {
  const { MongoClient } = require('mongodb');

  for (let i = 0; i < 30; i++) {
    try {
      const client = new MongoClient(MONGO_URL, { serverSelectionTimeoutMS: 2000 });
      await client.connect();
      await client.db().admin().ping();
      await client.close();
      console.log('MongoDB ready');
      return;
    } catch (err) {
      console.log(`Waiting for MongoDB... (${i + 1}/30)`);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error('MongoDB not reachable after 30 retries');
}

const express = require('express');
const bcrypt = require('bcryptjs');

/**
 * 创建一个 Express 实例用于测试
 * 不启动 listen，直接交给 supertest 处理
 */
function createTestApp() {
  const app = express();

  app.use(require('helmet')());
  app.use(express.json());
  app.use('/api', require('../../src/routes/auth'));
  app.use('/api/employees', require('../../src/routes/employees'));
  app.use('/api/users', require('../../src/routes/users'));
  app.use(require('../../src/middlewares').notFound);
  app.use(require('../../src/middlewares').errorHandler);

  return app;
}

/**
 * 获取数据库实例（封装顶层 require，确保写在 MongoDB ready 之后）
 */
function getDb() {
  return require('../../src/db/connection');
}

/**
 * 在测试数据库中插入一条管理员用户
 */
async function seedAdminUser() {
  const db = getDb();
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
  const db = getDb();
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
  const db = getDb();
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
  waitForMongo,
};
