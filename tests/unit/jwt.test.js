const { generateToken, verifyToken, extractToken } = require('../../src/config/jwt');

// Mock 用户数据，模拟 MongoDB document
const mockUser = {
  _id: '507f191e810c19729de860ea',
  username: 'testuser',
  roles: ['ROLE_USER'],
};

describe('JWT 工具函数', () => {
  describe('generateToken()', () => {
    it('应为有效用户生成合法的 JWT 字符串', () => {
      const token = generateToken(mockUser);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      // JWT 格式：header.payload.signature，3 段以 . 分隔
      expect(token.split('.')).toHaveLength(3);
    });

    it('生成的 token 应携带用户名和角色信息', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);
      expect(decoded.username).toBe('testuser');
      expect(decoded.authorities).toEqual(['ROLE_USER']);
    });

    it('生成的 token 应携带用户 ID（sub 字段）', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);
      expect(decoded.sub).toBe(mockUser._id.toString());
    });
  });

  describe('verifyToken()', () => {
    it('应能验证自己签发的 token', () => {
      const token = generateToken(mockUser);
      const decoded = verifyToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.iss).toBe('your-app-name');
      expect(decoded.aud).toBe('your-app-api');
    });

    it('对无效的 token 应抛出异常', () => {
      expect(() => verifyToken('invalid-token')).toThrow();
    });

    it('对被篡改的 token 应抛出异常', () => {
      const token = generateToken(mockUser);
      const tampered = `${token.slice(0, -5)}XXXXX`;
      expect(() => verifyToken(tampered)).toThrow();
    });

    it('对空字符串应抛出异常', () => {
      expect(() => verifyToken('')).toThrow();
    });
  });

  describe('extractToken()', () => {
    it('应从 Authorization header 提取 Bearer token', () => {
      const token = generateToken(mockUser);
      const req = { headers: { authorization: `Bearer ${token}` } };
      expect(extractToken(req)).toBe(token);
    });

    it('当没有 Authorization header 时应返回 null', () => {
      const req = { headers: {} };
      expect(extractToken(req)).toBeNull();
    });

    it('当 header 不是 Bearer 格式时应返回 null', () => {
      const req = { headers: { authorization: 'Basic abc123' } };
      expect(extractToken(req)).toBeNull();
    });
  });
});
