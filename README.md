# 项目 README.md 完整文档

我将为您创建一个完整的 README.md 文件，包含从部署到 JWT 功能测试的所有内容：

markdown

```
# Express.js + MongoDB REST API 项目

基于 Node.js、Express 和 MongoDB 构建的 RESTful API 服务，包含 JWT 认证和授权功能（JHipster 风格）。

## 📋 目录

- [项目概述](#项目概述)
- [技术栈](#技术栈)
- [功能特性](#功能特性)
- [项目结构](#项目结构)
- [安装与部署](#安装与部署)
- [环境配置](#环境配置)
- [数据库配置](#数据库配置)
- [JWT 认证说明](#jwt-认证说明)
- [API 端点文档](#api-端点文档)
- [测试指南](#测试指南)
- [常见问题](#常见问题)

---

## 项目概述

这是一个完整的 RESTful API 服务项目，提供员工管理和用户管理功能，并集成了 JWT 认证和基于角色的访问控制（RBAC）。项目采用 JHipster 风格的 JWT 实现，支持用户注册、登录、Token 认证和权限管理。

### 核心功能
- ✅ 员工管理（CRUD 操作）
- ✅ 用户管理（查询操作）
- ✅ JWT 认证（登录/注册）
- ✅ 基于角色的访问控制（RBAC）
- ✅ 数据验证（Joi）
- ✅ 错误处理中间件
- ✅ MongoDB 数据库集成

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Node.js | 14+ | JavaScript 运行时 |
| Express.js | 4.x | Web 应用框架 |
| MongoDB | 4.x+ | NoSQL 数据库 |
| JWT (jsonwebtoken) | 9.x | JSON Web Token 认证 |
| bcryptjs | 2.x | 密码加密 |
| Joi | 17.x | 数据验证 |
| Nodemon | 2.x | 开发环境热重载 |
| Helmet | 7.x | 安全中间件 |
| Morgan | 1.x | HTTP 请求日志 |

---

## 功能特性

### 1. 员工管理 (Employees)
- 获取所有员工
- 获取所有职位（去重）
- 根据 ID 获取员工
- 创建新员工（需要 ADMIN 角色）
- 更新员工信息（需要 ADMIN 角色）
- 删除员工（需要 ADMIN 角色）

### 2. 用户管理 (Users)
- 获取所有用户（需要 ADMIN 角色）
- 根据 ID 范围获取用户（需要 ADMIN 角色）
- 根据用户名获取用户
- 根据 ID 获取用户

### 3. 认证功能 (Auth)
- 用户注册
- 用户登录（JWT Token）
- 检查认证状态
- 获取当前用户信息

### 4. 安全特性
- 密码 bcrypt 加密（10 rounds）
- JWT Token 签名验证
- 基于角色的访问控制
- Token 过期机制（24小时）
- Helmet 安全头设置

---

## 项目结构
```



Study Project/
├── src/
│ ├── config/
│ │ └── jwt.js # JWT 配置和工具函数
│ ├── db/
│ │ ├── connection.js # MongoDB 连接
│ │ └── schema.js # 数据验证模式
│ ├── middlewares/
│ │ ├── auth.js # 认证和授权中间件
│ │ ├── index.js # 通用中间件
│ │ └── errorHandler.js # 错误处理
│ ├── routes/
│ │ ├── auth.js # 认证路由
│ │ ├── employees.js # 员工路由
│ │ └── users.js # 用户路由
│ ├── ui-routes/
│ │ ├── index.js # UI 路由
│ │ ├── public/ # 静态资源
│ │ └── views/ # EJS 模板
│ ├── app.js # Express 应用配置
│ └── server.js # 服务器入口
├── .[env.dev](https://env.dev/) # 开发环境配置
├── .env.prod # 生产环境配置
├── package.json # 项目依赖
└── README.md # 项目文档

text

```
---

## 安装与部署

### 前置要求
- Node.js 14+ ([下载地址](https://nodejs.org/))
- MongoDB 4+ ([下载地址](https://www.mongodb.com/try/download/community))
- npm 或 yarn 包管理器

### 安装步骤

#### 1. 克隆项目
```bash
git clone <your-repository-url>
cd Study\ Project
```



#### 2. 安装依赖

bash

```
npm install
```



#### 3. 安装额外依赖（JWT 功能）

bash

```
npm install jsonwebtoken bcryptjs express-jwt
```



#### 4. 配置环境变量

bash

```
# 复制开发环境配置
copy .env.dev .env
```



#### 5. 启动 MongoDB 服务

bash

```
# Windows（以管理员身份运行）
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# 或
mongod
```



#### 6. 启动应用

bash

```
# 开发模式（支持热重载）
npm run dev

# 生产模式
npm run prod
```



#### 7. 验证启动

成功启动后，终端应显示：

text

```
Server running on port: 8000
MongoDB connected to: my-employees
```



------

## 环境配置

### .env 文件配置

创建 `.env` 文件并配置以下变量：

env

```
# 服务器配置
PORT=8000
NODE_ENV=development

# 数据库配置
DB_URL=mongodb://dbadmin:MongoDB03@192.168.11.119:27017/my-employees?authSource=admin&readPreference=primary&ssl=false&directConnection=true

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production-use-strong-key
```



### 环境变量说明

| 变量名       | 说明               | 示例值                                   |
| :----------- | :----------------- | :--------------------------------------- |
| `PORT`       | 服务器端口         | `8000`                                   |
| `NODE_ENV`   | 运行环境           | `development` / `production`             |
| `DB_URL`     | MongoDB 连接字符串 | `mongodb://localhost:27017/my-employees` |
| `JWT_SECRET` | JWT 签名密钥       | 强随机字符串（Base64 编码）              |

### 生成强 JWT 密钥

bash

```
# 生成 64 位 Base64 密钥
openssl rand -base64 64
```



------

## 数据库配置

### 数据库信息

- **数据库名称**: `my-employees`
- **集合**:
  - `employees` - 员工信息
  - `user` - 用户信息

### 数据模型

#### employees 集合

json

```
{
  "_id": "ObjectId",
  "name": "String (3-30 chars)",
  "job": "String (3-30 chars)"
}
```



#### user 集合

json

```
{
  "_id": "ObjectId",
  "username": "String (3-50 chars, unique)",
  "password": "String (bcrypt encrypted)",
  "email": "String (valid email format)",
  "roles": ["ROLE_USER", "ROLE_ADMIN"],
  "activated": "Boolean",
  "langKey": "String",
  "createdBy": "String",
  "createdDate": "Date",
  "lastModifiedBy": "String",
  "lastModifiedDate": "Date"
}
```



### 创建管理员用户

使用 MongoDB Compass 或命令行：

javascript

```
// 连接到数据库
use my-employees

// 将现有用户升级为管理员
db.user.updateOne(
    { username: "admin" },
    { $set: { roles: ["ROLE_USER", "ROLE_ADMIN"] } }
)

// 或创建新管理员
db.user.insertOne({
    username: "superadmin",
    password: "$2a$10$...",  // 使用 bcrypt 加密
    email: "admin@company.com",
    roles: ["ROLE_USER", "ROLE_ADMIN"],
    activated: true
})
```



------

## JWT 认证说明

### JWT 配置

javascript

```
{
    secret: process.env.JWT_SECRET,
    expiresIn: 86400,  // 24 小时
    issuer: 'your-app-name',
    audience: 'your-app-api',
    algorithm: 'HS256'
}
```



### Token 结构

JHipster 风格的 JWT Payload：

json

```
{
    "sub": "用户ID (ObjectId)",
    "username": "用户名",
    "authorities": ["ROLE_USER"],
    "iat": 签发时间戳,
    "exp": 过期时间戳,
    "aud": "your-app-api",
    "iss": "your-app-name"
}
```



### 认证流程

1. **注册** → 创建新用户（密码加密）
2. **登录** → 验证凭据 → 生成 JWT Token
3. **请求** → 在 `Authorization` 头中携带 Token
4. **验证** → 中间件验证 Token → 挂载用户信息到 `req.user`
5. **授权** → 检查用户角色 → 允许/拒绝访问

### 角色权限

| 角色         | 权限                                   |
| :----------- | :------------------------------------- |
| `ROLE_USER`  | 读取员工和用户信息                     |
| `ROLE_ADMIN` | 所有操作（创建、更新、删除员工和用户） |

------

## API 端点文档

### 基础 URL

text

```
http://localhost:8000
```



### 认证相关端点

| 方法 | 端点                | 描述             | 认证 | 请求体                        |
| :--- | :------------------ | :--------------- | :--- | :---------------------------- |
| POST | `/api/register`     | 用户注册         | 否   | `{username, password, email}` |
| POST | `/api/authenticate` | 用户登录         | 否   | `{username, password}`        |
| GET  | `/api/authenticate` | 检查认证状态     | 是   | -                             |
| GET  | `/api/account`      | 获取当前用户信息 | 是   | -                             |

### 员工管理端点

| 方法   | 端点                  | 描述         | 认证 | 角色  | 请求体        |
| :----- | :-------------------- | :----------- | :--- | :---- | :------------ |
| GET    | `/api/employees`      | 获取所有员工 | 是   | USER  | -             |
| GET    | `/api/employees/jobs` | 获取所有职位 | 是   | USER  | -             |
| GET    | `/api/employees/:id`  | 获取单个员工 | 是   | USER  | -             |
| POST   | `/api/employees`      | 创建员工     | 是   | ADMIN | `{name, job}` |
| PUT    | `/api/employees/:id`  | 更新员工     | 是   | ADMIN | `{name, job}` |
| DELETE | `/api/employees/:id`  | 删除员工     | 是   | ADMIN | -             |

### 用户管理端点

| 方法 | 端点                            | 描述                 | 认证 | 角色  | 请求体 |
| :--- | :------------------------------ | :------------------- | :--- | :---- | :----- |
| GET  | `/api/users`                    | 获取所有用户         | 是   | ADMIN | -      |
| GET  | `/api/users/jobs`               | 获取所有职位         | 是   | USER  | -      |
| GET  | `/api/users/range?start=&end=`  | 根据 ID 范围获取用户 | 是   | ADMIN | -      |
| GET  | `/api/users/username/:username` | 根据用户名获取用户   | 是   | USER  | -      |
| GET  | `/api/users/:id`                | 根据 ID 获取用户     | 是   | USER  | -      |

### 错误响应格式

json

```
{
    "error": "Error type",
    "message": "Detailed error message",
    "status": 400
}
```



### 常见状态码

| 状态码 | 说明                       |
| :----- | :------------------------- |
| 200    | 成功                       |
| 201    | 创建成功                   |
| 400    | 请求参数错误               |
| 401    | 未认证（缺少或无效 Token） |
| 403    | 无权限（角色不足）         |
| 404    | 资源不存在                 |
| 409    | 资源已存在（冲突）         |
| 500    | 服务器内部错误             |

------

## 测试指南

### 使用 Apidog 测试

#### 1. 安装 Apidog

访问 https://apidog.com/ 下载并安装

#### 2. 创建环境变量

1. 打开 Apidog → 环境管理
2. 创建新环境 "本地开发"
3. 添加变量：
   - `baseUrl`: `http://localhost:8000`
   - `token`: 空

#### 3. 配置自动保存 Token

在登录请求的"后置操作"中添加：

javascript

```
const response = pm.response.json();
if (response.id_token) {
    pm.environment.set("token", response.id_token);
}
```



#### 4. 使用 Token

在所有需要认证的请求中，Headers 设置：

- Key: `Authorization`
- Value: `Bearer {{token}}`

### 测试用例

#### 测试 1: 用户注册

http

```
POST {{baseUrl}}/api/register
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com"
}
```



**预期响应**: 201 Created

#### 测试 2: 用户登录

http

```
POST {{baseUrl}}/api/authenticate
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123"
}
```



**预期响应**:

json

```
{
    "id_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 86400
}
```



#### 测试 3: 检查认证状态

http

```
GET {{baseUrl}}/api/authenticate
Authorization: Bearer {{token}}
```



**预期响应**:

json

```
{
    "authenticated": true,
    "username": "testuser"
}
```



#### 测试 4: 获取员工列表

http

```
GET {{baseUrl}}/api/employees
Authorization: Bearer {{token}}
```



**预期响应**: 员工数组

#### 测试 5: 创建员工（权限测试）

http

```
POST {{baseUrl}}/api/employees
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "name": "新员工",
    "job": "工程师"
}
```



**预期响应（普通用户）**: 403 Forbidden

#### 测试 6: 无 Token 访问

http

```
GET {{baseUrl}}/api/employees
```



**预期响应**: 401 Unauthorized

### 使用 curl 测试

#### 登录获取 Token

bash

```
curl -X POST http://localhost:8000/api/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```



#### 使用 Token 访问 API

bash

```
curl -X GET http://localhost:8000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```



#### 检查认证状态

bash

```
curl -X GET http://localhost:8000/api/authenticate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```



### 使用 PowerShell 测试

powershell

```
# 登录
$body = @{username="admin"; password="admin123"} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/authenticate" `
    -Method Post -Body $body -ContentType "application/json"
$token = $response.id_token

# 获取员工列表
Invoke-RestMethod -Uri "http://localhost:8000/api/employees" `
    -Headers @{Authorization = "Bearer $token"}
```



### 完整测试清单

| 测试项               | 端点                            | 方法 | 预期状态码 |
| :------------------- | :------------------------------ | :--- | :--------- |
| 用户注册             | `/api/register`                 | POST | 201        |
| 用户登录             | `/api/authenticate`             | POST | 200        |
| 认证状态             | `/api/authenticate`             | GET  | 200        |
| 获取账户信息         | `/api/account`                  | GET  | 200        |
| 获取员工列表         | `/api/employees`                | GET  | 200        |
| 创建员工（普通用户） | `/api/employees`                | POST | 403        |
| 创建员工（管理员）   | `/api/employees`                | POST | 201        |
| 获取所有用户         | `/api/users`                    | GET  | 403        |
| 获取特定用户         | `/api/users/username/:username` | GET  | 200        |
| 无 Token 访问        | `/api/employees`                | GET  | 401        |
| 无效 Token           | `/api/employees`                | GET  | 401        |

------

## 常见问题

### Q1: 启动时提示端口被占用

**解决方案**: 修改 `.env` 文件中的 `PORT` 值

env

```
PORT=3001
```



### Q2: MongoDB 连接失败

**解决方案**:

- 检查 MongoDB 服务是否运行：`net start MongoDB` (Windows) 或 `mongod` (Mac/Linux)
- 检查 `.env` 中的 `DB_URL` 是否正确
- 检查网络连接（如果使用远程数据库）

### Q3: JWT Token 验证失败

**解决方案**:

- 确保 Token 格式正确：`Bearer <token>`（注意空格）
- 检查 Token 是否过期
- 确认 `JWT_SECRET` 与生成时一致

### Q4: 普通用户无法创建员工

**解决方案**: 这是正常行为，需要将用户角色设置为 `ROLE_ADMIN`

### Q5: 如何创建管理员用户

**解决方案**: 通过 MongoDB 命令行或 Compass 更新用户角色

javascript

```
db.user.updateOne(
    { username: "your-username" },
    { $set: { roles: ["ROLE_USER", "ROLE_ADMIN"] } }
)
```



### Q6: Token 如何刷新

**解决方案**: 当前实现需要重新登录获取新 Token，可后续添加 refresh token 功能

### Q7: 生产环境部署注意事项

- 使用强 `JWT_SECRET`（至少 64 位随机字符串）
- 启用 HTTPS
- 设置合理的 Token 过期时间
- 限制 API 请求频率
- 配置 CORS 策略

------

## 安全建议

1. **JWT 密钥管理**
   - 不要将密钥提交到版本控制
   - 使用环境变量存储
   - 定期更换密钥
2. **密码安全**
   - 使用 bcrypt 加密（salt rounds ≥ 10）
   - 设置密码强度要求
3. **Token 安全**
   - 设置合理的过期时间
   - 使用 HTTPS 传输
   - 不要在 URL 中传递 Token
4. **API 安全**
   - 实现请求限流
   - 验证所有输入数据
   - 使用 Helmet 中间件

------

## 贡献指南

欢迎提交 Issue 和 Pull Request！

------

## 许可证

MIT License

------

## 联系方式

如有问题，请提交 Issue 或联系项目维护者。

------

**最后更新**: 2026-03-24

text

```
这个 README.md 文件包含了：

1. **完整的项目概述** - 功能特性和技术栈说明
2. **安装部署指南** - 从零开始的完整安装步骤
3. **环境配置说明** - 详细的配置文件说明
4. **JWT 认证机制** - Token 结构、认证流程、权限说明
5. **API 端点文档** - 所有端点的完整文档
6. **测试指南** - 使用 Apidog、curl、PowerShell 的测试方法
7. **常见问题解答** - 常见问题的解决方案
8. **安全建议** - 生产环境部署建议

您可以将此内容保存为 `README.md` 文件放在项目根目录。如果需要调整任何部分，请告诉我！
```
