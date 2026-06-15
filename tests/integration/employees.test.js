const request = require('supertest');
const {
  createTestApp, seedAdminUser, seedRegularUser, cleanDatabase, waitForMongo,
} = require('../helpers/setup');

let app;
let adminToken;
let userToken;

beforeAll(async () => {
  await waitForMongo();
  await cleanDatabase();
  await seedAdminUser();
  await seedRegularUser();
  app = createTestApp();

  // 管理员登录获取 token
  const adminRes = await request(app)
    .post('/api/authenticate')
    .send({ username: 'admin', password: 'admin123' });
  adminToken = adminRes.body.id_token;

  // 普通用户登录获取 token
  const userRes = await request(app)
    .post('/api/authenticate')
    .send({ username: 'regularuser', password: 'user123' });
  userToken = userRes.body.id_token;
}, 60000);

afterAll(async () => {
  await cleanDatabase();
});

describe('Employees API - 员工管理接口', () => {
  let createdEmployeeId;

  // ── 创建员工 ──────────────────────────────────────────────────────────────
  describe('POST /api/employees（管理员）', () => {
    it('管理员应能创建员工并返回 201', async () => {
      const res = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '测试员工', job: '工程师' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('测试员工');
      expect(res.body.job).toBe('工程师');
      createdEmployeeId = res.body._id;
    });

    it('名称重复应返回 409', async () => {
      const res = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '测试员工', job: '工程师' });

      expect(res.status).toBe(409);
    });
  });

  // ── 权限测试 ──────────────────────────────────────────────────────────────
  describe('POST /api/employees（权限控制）', () => {
    it('普通用户创建员工应返回 403', async () => {
      const res = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: '不能创建', job: '设计师' });

      expect(res.status).toBe(403);
    });

    it('未认证用户创建员工应返回 401', async () => {
      const res = await request(app)
        .post('/api/employees')
        .send({ name: '匿名', job: '黑客' });

      expect(res.status).toBe(401);
    });
  });

  // ── 获取员工列表 ──────────────────────────────────────────────────────────
  describe('GET /api/employees', () => {
    it('认证用户应能获取员工列表', async () => {
      const res = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('未认证用户获取员工列表应返回 401', async () => {
      const res = await request(app).get('/api/employees');
      expect(res.status).toBe(401);
    });
  });

  // ── 获取单个员工 ──────────────────────────────────────────────────────────
  describe('GET /api/employees/:id', () => {
    it('应能通过 ID 获取员工', async () => {
      const res = await request(app)
        .get(`/api/employees/${createdEmployeeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('测试员工');
    });

    it('不存在的 ID 应返回 404', async () => {
      const res = await request(app)
        .get('/api/employees/507f191e810c19729de860ee')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ── 更新员工 ──────────────────────────────────────────────────────────────
  describe('PUT /api/employees/:id', () => {
    it('管理员应能更新员工信息', async () => {
      const res = await request(app)
        .put(`/api/employees/${createdEmployeeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '更新后的员工', job: '高级工程师' });

      expect(res.status).toBe(200);
    });

    it('普通用户更新员工应返回 403', async () => {
      const res = await request(app)
        .put(`/api/employees/${createdEmployeeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: '被阻止', job: '不需要' });

      expect(res.status).toBe(403);
    });
  });

  // ── 获取职位列表 ──────────────────────────────────────────────────────────
  describe('GET /api/employees/jobs', () => {
    it('应返回去重后的职位列表', async () => {
      const res = await request(app)
        .get('/api/employees/jobs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // ── 删除员工 ──────────────────────────────────────────────────────────────
  describe('DELETE /api/employees/:id', () => {
    it('管理员应能删除员工', async () => {
      const res = await request(app)
        .delete(`/api/employees/${createdEmployeeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Employee has been deleted');
    });

    it('普通用户删除员工应返回 403', async () => {
      // 先创建一个员工来测试
      const createRes = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '待删', job: '实习生' });
      const tempId = createRes.body._id;

      const res = await request(app)
        .delete(`/api/employees/${tempId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);

      // 清理
      await request(app)
        .delete(`/api/employees/${tempId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    });
  });
});
