# Express.js + MongoDB REST API

[![CI](https://github.com/NoctisRen/StudyProject/actions/workflows/ci.yml/badge.svg)](https://github.com/NoctisRen/StudyProject/actions/workflows/ci.yml)
[![Tests](https://github.com/NoctisRen/StudyProject/actions/workflows/test.yml/badge.svg)](https://github.com/NoctisRen/StudyProject/actions/workflows/test.yml)

基于 Node.js、Express 和 MongoDB 构建的 RESTful API 服务，包含 JWT 认证和基于角色的访问控制（RBAC），采用 JHipster 风格 JWT 实现。

---

## 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [功能特性](#功能特性)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [环境配置](#环境配置)
- [API 端点文档](#api-端点文档)
- [测试指南](#测试指南)
- [Docker 部署](#docker-部署)
- [CI/CD](#cicd)
- [常见问题](#常见问题)

---

## 项目概述

完整的 REST API，提供员工管理和用户管理功能，集成 JWT 认证和基于角色的访问控制（RBAC）。

- 员工 CRUD（仅管理员可写）
- 用户注册/登录/认证
- JWT 无状态认证（24h 过期）
- 角色鉴权：`ROLE_USER` / `ROLE_ADMIN`
- Joi 请求参数校验
- 统一错误处理
- MongoDB（通过 `monk` 驱动）

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Node.js | 24+ | JavaScript 运行时 |
| Express.js | 4.x | Web 框架 |
| MongoDB | 7+ | NoSQL 数据库 |
| monk | 7.x | MongoDB 驱动 |
| jsonwebtoken | 9.x | JWT 签发与验证 |
| bcryptjs | 3.x | 密码加密 |
| Joi | 17.x | 数据验证 |
| Helmet | 7.x | HTTP 安全头 |

---

## 功能特性

### 员工管理

| 功能 | 方法 | 端点 | 权限 |
|------|------|------|------|
| 获取所有员工 | GET | `/api/employees` | `ROLE_USER` |
| 获取所有职位 | GET | `/api/employees/jobs` | `ROLE_USER` |
| 获取单个员工 | GET | `/api/employees/:id` | `ROLE_USER` |
| 创建员工 | POST | `/api/employees` | `ROLE_ADMIN` |
| 更新员工 | PUT | `/api/employees/:id` | `ROLE_ADMIN` |
| 删除员工 | DELETE | `/api/employees/:id` | `ROLE_ADMIN` |

### 用户管理

| 功能 | 方法 | 端点 | 权限 |
|------|------|------|------|
| 获取所有用户 | GET | `/api/users` | `ROLE_ADMIN` |
| 根据用户名查询 | GET | `/api/users/username/:username` | `ROLE_USER` |
| 根据 ID 范围查询 | GET | `/api/users/range` | `ROLE_ADMIN` |
| 根据 ID 查询 | GET | `/api/users/:id` | `ROLE_USER` |

### 认证

| 功能 | 方法 | 端点 | 认证 |
|------|------|------|------|
| 用户注册 | POST | `/api/register` | 公开 |
| 用户登录 | POST | `/api/authenticate` | 公开 |
| 检查认证状态 | GET | `/api/authenticate` | 已认证 |
| 获取当前用户信息 | GET | `/api/account` | 已认证 |

---

## 快速开始

### 前置要求

- Node.js 24+
- MongoDB 7+（本地或远程）
- npm

### 本地运行

```bash
# 1. 克隆
git clone https://github.com/NoctisRen/StudyProject.git
cd StudyProject

# 2. 安装依赖
npm install

# 3. 配置环境变量（参见下方说明）
cp .env.example .env.dev
# 编辑 .env.dev，至少设置 DB_URL 和 JWT_SECRET

# 4. 启动（开发模式，支持热重载）
npm run dev
```

应用启动后默认监听 `http://localhost:8000`。

### 可用命令

```bash
npm run dev          # 开发模式（nodemon 热重载）
npm run prod         # 生产模式
npm test             # 运行全部测试
npm run test:unit    # 仅单元测试
npm run test:integration  # 仅集成测试（需 MongoDB）
npm run test:coverage     # 测试覆盖率报告
npm run lint         # ESLint 代码检查
npm run lint:fix     # 自动修复 ESLint 错误
```

---

## 项目结构

```
StudyProject/
├── src/
│   ├── config/
│   │   └── jwt.js              # JWT 配置与工具函数
│   ├── db/
│   │   ├── connection.js       # MongoDB 连接（monk）
│   │   └── schema.js           # Joi 验证模式
│   ├── middlewares/
│   │   ├── auth.js             # JWT 认证 + 角色授权中间件
│   │   └── index.js            # 通用中间件集合
│   ├── routes/
│   │   ├── auth.js             # 认证路由（注册/登录/状态/账户）
│   │   ├── employees.js        # 员工 CRUD 路由
│   │   └── users.js            # 用户管理路由
│   ├── ui-routes/              # EJS 界面（可选）
│   ├── app.js                  # Express 应用入口
│   └── server.js               # 服务器启动入口
├── tests/
│   ├── helpers/
│   │   └── setup.js            # 测试辅助（waitForMongo, seed, clean）
│   ├── unit/
│   │   ├── jwt.test.js         # JWT 工具函数单元测试（8 tests）
│   │   └── schema.test.js      # Schema 验证单元测试（14 tests）
│   └── integration/
│       ├── auth.test.js        # 认证 API 集成测试（11 tests）
│       └── employees.test.js   # 员工 API + RBAC 集成测试（25 tests）
├── .github/workflows/
│   ├── ci.yml                  # CI 工作流：ESLint + npm audit + build + Docker
│   └── test.yml                # 测试工作流：单元 + 集成（MongoDB service）
├── Dockerfile                  # 镜像构建（Node 24 Alpine）
├── docker-compose.yml          # 容器编排（api + mongo）
├── jest.config.js
├── .eslintrc.js
└── .env.example
```

---

## 环境配置

### 环境变量

| 变量 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `PORT` | 否 | 服务器端口（默认 8000） | `8000` |
| `NODE_ENV` | 否 | 运行环境 | `development` / `production` |
| `DB_URL` | **是** | MongoDB 连接串 | `mongodb://localhost:27017/my-employees` |
| `JWT_SECRET` | **是** | JWT 签名密钥（建议 64 位 Base64） | 见下方生成方法 |

### 启动模式与配置加载

应用通过 `dotenv` 按 `NODE_ENV` 加载对应的配置文件：

| NODE_ENV | 加载文件 | 用途 |
|----------|---------|------|
| `development`（默认） | `.env.development` | 本地开发 |
| `production` | `.env.production` | 生产部署 |
| `test` | `.env.test` | CI 测试 |

### 生成 JWT 密钥

```bash
# 生成 64 位 Base64 密钥
openssl rand -base64 64
```

### .env.example 示例

```
PORT=8000
DB_URL=mongodb://localhost:27017/my-employees
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

---

## API 端点文档

### 认证端点

#### 注册用户

```
POST /api/register
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com"
}
```

**成功响应** `201 Created`：

```json
{
    "message": "User registered successfully",
    "user": {
        "_id": "69c2a7d754086124ad6a1694",
        "username": "testuser",
        "email": "test@example.com",
        "roles": ["ROLE_USER"],
        "activated": true,
        "langKey": "en"
    }
}
```

#### 登录

```
POST /api/authenticate
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123"
}
```

**成功响应** `200 OK`：

```json
{
    "id_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 86400
}
```

#### 检查认证状态

```
GET /api/authenticate
Authorization: Bearer <token>
```

**成功响应**：

```json
{
    "authenticated": true,
    "username": "testuser"
}
```

#### 获取账户信息

```
GET /api/account
Authorization: Bearer <token>
```

**成功响应**：

```json
{
    "id": "69c2a7d754086124ad6a1694",
    "login": "testuser",
    "username": "testuser",
    "email": "test@example.com",
    "authorities": ["ROLE_USER"],
    "activated": true,
    "langKey": "en"
}
```

### 员工端点

#### 获取所有员工

```
GET /api/employees
Authorization: Bearer <token>
```

**响应** `200 OK`：

```json
[
    { "_id": "65...", "name": "张三", "job": "工程师" },
    { "_id": "65...", "name": "李四", "job": "经理" }
]
```

#### 创建员工（仅 ADMIN）

```
POST /api/employees
Authorization: Bearer <admin-token>
Content-Type: application/json

{
    "name": "王五",
    "job": "设计师"
}
```

**成功** `201 Created` | **权限不足** `403 Forbidden`

#### 更新员工（仅 ADMIN）

```
PUT /api/employees/:id
Authorization: Bearer <admin-token>
Content-Type: application/json

{
    "name": "更新后",
    "job": "高级工程师"
}
```

#### 删除员工（仅 ADMIN）

```
DELETE /api/employees/:id
Authorization: Bearer <admin-token>
```

**成功** `200 OK`：`{ "message": "Employee has been deleted" }`

### 用户端点

| 方法 | 端点 | 描述 | 权限 |
|------|------|------|------|
| GET | `/api/users` | 获取所有用户 | `ROLE_ADMIN` |
| GET | `/api/users/username/:username` | 根据用户名查询 | `ROLE_USER` |
| GET | `/api/users/range?start=&end=` | 按 ID 范围查询 | `ROLE_ADMIN` |
| GET | `/api/users/:id` | 根据 ID 查询 | `ROLE_USER` |

### 数据模型

#### employees

```json
{
    "_id": "ObjectId",
    "name": "String (3-50 字符)",
    "job": "String (3-50 字符)"
}
```

#### user

```json
{
    "_id": "ObjectId",
    "username": "String (3-50 字符, 唯一)",
    "password": "String (bcrypt 加密)",
    "email": "String (有效邮箱格式)",
    "roles": ["ROLE_USER"],
    "activated": true,
    "langKey": "en",
    "createdBy": "system",
    "createdDate": "Date"
}
```

### 错误响应格式

| 状态码 | 说明 |
|--------|------|
| `200` | 成功 |
| `201` | 创建成功 |
| `400` | 请求参数无效 |
| `401` | 未认证（缺少/无效 Token） |
| `403` | 无权限（角色不足） |
| `404` | 资源不存在 |
| `409` | 资源冲突（已存在） |
| `500` | 服务器内部错误 |

**401 示例**：

```json
{
    "error": "Authentication required",
    "title": "Unauthorized",
    "status": 401,
    "message": "No token provided"
}
```

**403 示例**：

```json
{
    "error": "Forbidden",
    "message": "You do not have the required permissions"
}
```

---

## 测试指南

### 自动化测试（推荐）

项目使用 **Jest + Supertest** 进行自动化测试，共 **58 个测试用例**：

```bash
# 全部测试
npm test

# 仅单元测试
npm run test:unit

# 仅集成测试（需运行中的 MongoDB）
npm run test:integration

# 测试覆盖率报告
npm run test:coverage
```

### 测试分类

| 类型 | 文件 | 测试数 | 依赖 |
|------|------|--------|------|
| 单元测试 | `tests/unit/jwt.test.js` | 8 | 无 |
| 单元测试 | `tests/unit/schema.test.js` | 14 | 无 |
| 集成测试 | `tests/integration/auth.test.js` | 11 | MongoDB |
| 集成测试 | `tests/integration/employees.test.js` | 25 | MongoDB |

### 手动测试（curl）

```bash
# 登录
TOKEN=$(curl -s -X POST http://localhost:8000/api/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).id_token")

# 获取员工列表
curl -s http://localhost:8000/api/employees \
  -H "Authorization: Bearer $TOKEN"

# 创建员工（管理员）
curl -s -X POST http://localhost:8000/api/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"新员工","job":"工程师"}'
```

### 使用 Apidog

1. 打开 Apidog，创建环境"本地开发"
2. 设置变量：`baseUrl: http://localhost:8000`，`token: 空`
3. 在登录请求的"后置操作"中加入：
   ```javascript
   const response = pm.response.json();
   if (response.id_token) {
       pm.environment.set("token", response.id_token);
   }
   ```
4. 所有需认证的请求添加 Header：`Authorization: Bearer {{token}}`

---

## Docker 部署

详见 [DOCKER.md](./DOCKER.md)。

```bash
# 构建并启动
docker compose up -d --build

# 验证
curl -s http://localhost:8000/api/authenticate
# 返回 401 说明服务正常运行

# 停止
docker compose down -v
```

---

## CI/CD

项目包含两个 GitHub Actions 工作流：

### CI（`ci.yml`）

| Job | 说明 | 触发条件 |
|-----|------|---------|
| 代码检查 | ESLint 静态分析 | push + PR |
| 安全审计 | npm audit 漏洞扫描 | push + PR |
| 构建验证 | Node 语法 + 依赖检查 | push + PR |
| Docker 构建 | Buildx 镜像构建（不推送） | push + PR |

### Tests（`test.yml`）

| Job | 说明 | 依赖 |
|-----|------|------|
| 单元测试 | 22 个测试 | 无 |
| 集成测试 | 36 个测试 | GitHub Actions `services.mongo` |

---

## 常见问题

### MongoDB 连接失败

```bash
# 检查 MongoDB 是否运行
mongosh --eval "db.runCommand({ping:1})"

# 确认 .env.* 中的 DB_URL 正确
env | grep DB_URL
```

### JWT Token 验证失败

- 确保格式为 `Bearer <token>`（Bearer 后有空格）
- 确认 Token 未过期（默认 24h）
- 确认 `JWT_SECRET` 与登录时一致

### 普通用户无法创建/修改员工

这是正常行为，需将用户角色提升为 `ROLE_ADMIN`：

```javascript
// 在 MongoDB 中执行
db.user.updateOne(
    { username: "your-username" },
    { $set: { roles: ["ROLE_USER", "ROLE_ADMIN"] } }
)
```

### 端口被占用

修改 `PORT` 环境变量：
```bash
export PORT=3001
npm run dev
```

---

## 安全建议

- 生产环境使用强 `JWT_SECRET`（`openssl rand -base64 64`）
- 生产环境启用 HTTPS
- 完善用户输入校验（已有 Joi）
- 启用 API 请求限流
- CORS 配置白名单
- 定期更新 npm 依赖（`npm audit`）

---

MIT License. 最后更新: 2026-06-15
