const request = require('supertest');
const { createTestApp, cleanDatabase, waitForMongo } = require('../helpers/setup');

let app;

beforeAll(async () => {
  // 等待 MongoDB 就绪（GitHub Actions service container 需要时间）
  await waitForMongo();
  // 清空测试数据
  await cleanDatabase();
  app = createTestApp();
}, 60000);

afterAll(async () => {
  await cleanDatabase();
});

describe('Auth API - 认证接口', () => {
  // ── 注册 ──────────────────────────────────────────────────────────────────
  describe('POST /api/register', () => {
    it('应成功注册新用户并返回 201', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'testregister', password: 'pass123', email: 'testreg@example.com' });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.user.username).toBe('testregister');
      // 不应该返回密码
      expect(res.body.user.password).toBeUndefined();
    });

    it('重复用户名应返回 409', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'testregister', password: 'pass123', email: 'another@example.com' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Username already exists');
    });

    it('缺失必填字段应返回 400', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'incomplete' });

      expect(res.status).toBe(400);
    });
  });

  // ── 登录 ──────────────────────────────────────────────────────────────────
  describe('POST /api/authenticate', () => {
    it('使用正确凭据应返回 JWT token', async () => {
      const res = await request(app)
        .post('/api/authenticate')
        .send({ username: 'testregister', password: 'pass123' });

      expect(res.status).toBe(200);
      expect(res.body.id_token).toBeDefined();
      expect(res.body.token_type).toBe('Bearer');
      expect(res.body.expires_in).toBe(86400);
    });

    it('错误密码应返回 401', async () => {
      const res = await request(app)
        .post('/api/authenticate')
        .send({ username: 'testregister', password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });

    it('不存在的用户名应返回 401', async () => {
      const res = await request(app)
        .post('/api/authenticate')
        .send({ username: 'nonexistent', password: 'pass123' });

      expect(res.status).toBe(401);
    });

    it('缺失密码应返回 400', async () => {
      const res = await request(app)
        .post('/api/authenticate')
        .send({ username: 'testregister' });

      expect(res.status).toBe(400);
    });
  });

  // ── 检查认证状态 ──────────────────────────────────────────────────────────
  describe('GET /api/authenticate', () => {
    it('带有效 token 应返回认证状态', async () => {
      // 先登录获取 token
      const loginRes = await request(app)
        .post('/api/authenticate')
        .send({ username: 'testregister', password: 'pass123' });
      const token = loginRes.body.id_token;

      const res = await request(app)
        .get('/api/authenticate')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.authenticated).toBe(true);
      expect(res.body.username).toBe('testregister');
    });

    it('不带 token 应返回 401', async () => {
      const res = await request(app)
        .get('/api/authenticate');

      expect(res.status).toBe(401);
    });
  });

  // ── 获取账户信息 ──────────────────────────────────────────────────────────
  describe('GET /api/account', () => {
    it('带有效 token 应返回账户信息', async () => {
      const loginRes = await request(app)
        .post('/api/authenticate')
        .send({ username: 'testregister', password: 'pass123' });
      const token = loginRes.body.id_token;

      const res = await request(app)
        .get('/api/account')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.login).toBe('testregister');
      expect(res.body.email).toBe('testreg@example.com');
    });

    it('不带 token 应返回 401', async () => {
      const res = await request(app)
        .get('/api/account');

      expect(res.status).toBe(401);
    });
  });
});
