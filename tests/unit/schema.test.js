const { employeeSchema, userSchema, loginSchema } = require('../../src/db/schema');

describe('Joi 数据验证 Schema', () => {
  describe('employeeSchema', () => {
    it('合法的员工数据应通过验证', async () => {
      const data = { name: '张三丰', job: '工程师' };
      await expect(employeeSchema.validateAsync(data)).resolves.toEqual(data);
    });

    it('name 太短（<3字符）应拒绝', async () => {
      await expect(employeeSchema.validateAsync({ name: 'AB', job: '工程师' }))
        .rejects.toThrow();
    });

    it('name 太长（>30字符）应拒绝', async () => {
      await expect(employeeSchema.validateAsync({ name: 'A'.repeat(31), job: '工程师' }))
        .rejects.toThrow();
    });

    it('缺失 name 应拒绝', async () => {
      await expect(employeeSchema.validateAsync({ job: '工程师' }))
        .rejects.toThrow();
    });

    it('缺失 job 应拒绝', async () => {
      await expect(employeeSchema.validateAsync({ name: '张三' }))
        .rejects.toThrow();
    });
  });

  describe('loginSchema', () => {
    it('合法的登录凭据应通过验证', async () => {
      const data = { username: 'testuser', password: 'pass123' };
      await expect(loginSchema.validateAsync(data)).resolves.toEqual(data);
    });

    it('缺失 username 应拒绝', async () => {
      await expect(loginSchema.validateAsync({ password: 'pass123' }))
        .rejects.toThrow();
    });

    it('缺失 password 应拒绝', async () => {
      await expect(loginSchema.validateAsync({ username: 'testuser' }))
        .rejects.toThrow();
    });
  });

  describe('userSchema', () => {
    it('合法的用户注册数据应通过验证', async () => {
      const data = { username: 'newuser', password: 'password123', email: 'new@example.com' };
      const validated = await userSchema.validateAsync(data);
      expect(validated.username).toBe('newuser');
      expect(validated.email).toBe('new@example.com');
      // 应设置默认值
      expect(validated.roles).toEqual(['ROLE_USER']);
      expect(validated.activated).toBe(true);
    });

    it('email 格式非法应拒绝', async () => {
      await expect(userSchema.validateAsync({
        username: 'test', password: 'pass123', email: 'not-an-email',
      })).rejects.toThrow();
    });

    it('密码太短（<6字符）应拒绝', async () => {
      await expect(userSchema.validateAsync({
        username: 'test', password: '12345', email: 'test@example.com',
      })).rejects.toThrow();
    });

    it('username 太短（<3字符）应拒绝', async () => {
      await expect(userSchema.validateAsync({
        username: 'ab', password: 'pass123', email: 'test@example.com',
      })).rejects.toThrow();
    });
  });
});
