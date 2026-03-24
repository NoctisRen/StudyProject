Express.js + MongoDB REST API 项目
基于 Node.js、Express 和 MongoDB 构建的 RESTful API 服务，包含 JWT 认证和授权功能（JHipster 风格）。

目录
项目概述

技术栈

功能特性

项目结构

安装与部署

环境配置

数据库配置

JWT 认证说明

API 端点文档

测试指南

常见问题

项目概述
这是一个完整的 RESTful API 服务项目，提供员工管理和用户管理功能，并集成了 JWT 认证和基于角色的访问控制（RBAC）。项目采用 JHipster 风格的 JWT 实现，支持用户注册、登录、Token 认证和权限管理。

核心功能
员工管理（CRUD 操作）

用户管理（查询操作）

JWT 认证（登录/注册）

基于角色的访问控制（RBAC）

数据验证（Joi）

错误处理中间件

MongoDB 数据库集成

技术栈
技术	版本	说明
Node.js	14+	JavaScript 运行时
Express.js	4.x	Web 应用框架
MongoDB	4.x+	NoSQL 数据库
JWT (jsonwebtoken)	9.x	JSON Web Token 认证
bcryptjs	2.x	密码加密
Joi	17.x	数据验证
Nodemon	2.x	开发环境热重载
Helmet	7.x	安全中间件
Morgan	1.x	HTTP 请求日志
功能特性
1. 员工管理 (Employees)
功能	方法	端点	权限要求
获取所有员工	GET	/api/employees	ROLE_USER
获取所有职位	GET	/api/employees/jobs	ROLE_USER
根据 ID 获取员工	GET	/api/employees/:id	ROLE_USER
创建新员工	POST	/api/employees	ROLE_ADMIN
更新员工信息	PUT	/api/employees/:id	ROLE_ADMIN
删除员工	DELETE	/api/employees/:id	ROLE_ADMIN
2. 用户管理 (Users)
功能	方法	端点	权限要求
获取所有用户	GET	/api/users	ROLE_ADMIN
获取所有职位	GET	/api/users/jobs	ROLE_USER
根据 ID 范围获取用户	GET	/api/users/range	ROLE_ADMIN
根据用户名获取用户	GET	/api/users/username/:username	ROLE_USER
根据 ID 获取用户	GET	/api/users/:id	ROLE_USER
3. 认证功能 (Auth)
功能	方法	端点	权限要求
用户注册	POST	/api/register	公开
用户登录	POST	/api/authenticate	公开
检查认证状态	GET	/api/authenticate	已认证
获取当前用户信息	GET	/api/account	已认证
4. 安全特性
密码 bcrypt 加密（10 rounds）

JWT Token 签名验证

基于角色的访问控制

Token 过期机制（24小时）

Helmet 安全头设置

项目结构
text
Study Project/
├── src/
│   ├── config/
│   │   └── jwt.js                 # JWT 配置和工具函数
│   ├── db/
│   │   ├── connection.js          # MongoDB 连接
│   │   └── schema.js              # 数据验证模式
│   ├── middlewares/
│   │   ├── auth.js                # 认证和授权中间件
│   │   ├── index.js               # 通用中间件
│   │   └── errorHandler.js        # 错误处理
│   ├── routes/
│   │   ├── auth.js                # 认证路由
│   │   ├── employees.js           # 员工路由
│   │   └── users.js               # 用户路由
│   ├── ui-routes/
│   │   ├── index.js               # UI 路由
│   │   ├── public/                # 静态资源
│   │   └── views/                 # EJS 模板
│   ├── app.js                     # Express 应用配置
│   └── server.js                  # 服务器入口
├── .env.dev                       # 开发环境配置
├── .env.prod                      # 生产环境配置
├── package.json                   # 项目依赖
└── README.md                      # 项目文档
安装与部署
前置要求
Node.js 14+ (下载地址)

MongoDB 4+ (下载地址)

npm 或 yarn 包管理器

安装步骤
1. 克隆项目
bash
git clone <your-repository-url>
cd Study\ Project
2. 安装依赖
bash
npm install
3. 安装额外依赖（JWT 功能）
bash
npm install jsonwebtoken bcryptjs
4. 配置环境变量
bash
# 复制开发环境配置
copy .env.dev .env
5. 启动 MongoDB 服务
bash
# Windows（以管理员身份运行）
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# 或
mongod
6. 启动应用
bash
# 开发模式（支持热重载）
npm run dev

# 生产模式
npm run prod
7. 验证启动
成功启动后，终端应显示：

text
Server running on port: 8000
MongoDB connected to: my-employees
环境配置
.env 文件配置
创建 .env 文件并配置以下变量：

env
# 服务器配置
PORT=8000
NODE_ENV=development

# 数据库配置
DB_URL=mongodb://dbadmin:MongoDB03@192.168.11.119:27017/my-employees?authSource=admin&readPreference=primary&ssl=false&directConnection=true

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production-use-strong-key
环境变量说明
变量名	说明	示例值
PORT	服务器端口	8000
NODE_ENV	运行环境	development / production
DB_URL	MongoDB 连接字符串	mongodb://localhost:27017/my-employees
JWT_SECRET	JWT 签名密钥	强随机字符串（Base64 编码）
生成强 JWT 密钥
bash
# 生成 64 位 Base64 密钥
openssl rand -base64 64
数据库配置
数据库信息
数据库名称: my-employees

集合:

employees - 员工信息

user - 用户信息

数据模型
employees 集合
json
{
  "_id": "ObjectId",
  "name": "String (3-30 chars)",
  "job": "String (3-30 chars)"
}
user 集合
json
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
创建管理员用户
使用 MongoDB Compass 或命令行：

javascript
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
JWT 认证说明
JWT 配置
javascript
{
    secret: process.env.JWT_SECRET,
    expiresIn: 86400,  // 24 小时
    issuer: 'your-app-name',
    audience: 'your-app-api',
    algorithm: 'HS256'
}
Token 结构
JHipster 风格的 JWT Payload：

json
{
    "sub": "用户ID (ObjectId)",
    "username": "用户名",
    "authorities": ["ROLE_USER"],
    "iat": 签发时间戳,
    "exp": 过期时间戳,
    "aud": "your-app-api",
    "iss": "your-app-name"
}
认证流程
注册 → 创建新用户（密码加密）

登录 → 验证凭据 → 生成 JWT Token

请求 → 在 Authorization 头中携带 Token

验证 → 中间件验证 Token → 挂载用户信息到 req.user

授权 → 检查用户角色 → 允许/拒绝访问

角色权限
角色	权限
ROLE_USER	读取员工和用户信息
ROLE_ADMIN	所有操作（创建、更新、删除员工和用户）
API 端点文档
基础 URL
text
http://localhost:8000
认证相关端点
方法	端点	描述	认证	请求体
POST	/api/register	用户注册	否	{username, password, email}
POST	/api/authenticate	用户登录	否	{username, password}
GET	/api/authenticate	检查认证状态	是	-
GET	/api/account	获取当前用户信息	是	-
注册请求示例
http
POST http://localhost:8000/api/register
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com"
}
注册响应示例
json
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
登录请求示例
http
POST http://localhost:8000/api/authenticate
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123"
}
登录响应示例
json
{
    "id_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 86400
}
检查认证状态
http
GET http://localhost:8000/api/authenticate
Authorization: Bearer <your-token>
认证状态响应
json
{
    "authenticated": true,
    "username": "testuser"
}
获取账户信息
http
GET http://localhost:8000/api/account
Authorization: Bearer <your-token>
账户信息响应
json
{
    "id": "69c2a7d754086124ad6a1694",
    "login": "testuser",
    "username": "testuser",
    "email": "test@example.com",
    "authorities": ["ROLE_USER"],
    "activated": true,
    "langKey": "en"
}
员工管理端点
方法	端点	描述	认证	角色	请求体
GET	/api/employees	获取所有员工	是	USER	-
GET	/api/employees/jobs	获取所有职位	是	USER	-
GET	/api/employees/:id	获取单个员工	是	USER	-
POST	/api/employees	创建员工	是	ADMIN	{name, job}
PUT	/api/employees/:id	更新员工	是	ADMIN	{name, job}
DELETE	/api/employees/:id	删除员工	是	ADMIN	-
获取所有员工
http
GET http://localhost:8000/api/employees
Authorization: Bearer <your-token>
获取所有员工响应
json
[
    {
        "_id": "655afa8196943302b03283bd",
        "name": "张三",
        "job": "工程师"
    },
    {
        "_id": "655afa8196943302b03283be",
        "name": "李四",
        "job": "经理"
    }
]
创建员工（需要 ADMIN 角色）
http
POST http://localhost:8000/api/employees
Authorization: Bearer <admin-token>
Content-Type: application/json

{
    "name": "王五",
    "job": "设计师"
}
创建员工响应
json
{
    "_id": "69c2a7d754086124ad6a1695",
    "name": "王五",
    "job": "设计师"
}
权限不足响应（403）
json
{
    "error": "Forbidden",
    "message": "You do not have the required permissions"
}
用户管理端点
方法	端点	描述	认证	角色	请求体
GET	/api/users	获取所有用户	是	ADMIN	-
GET	/api/users/jobs	获取所有职位	是	USER	-
GET	/api/users/range?start=&end=	根据 ID 范围获取用户	是	ADMIN	-
GET	/api/users/username/:username	根据用户名获取用户	是	USER	-
GET	/api/users/:id	根据 ID 获取用户	是	USER	-
根据用户名获取用户
http
GET http://localhost:8000/api/users/username/testuser
Authorization: Bearer <your-token>
根据用户名获取用户响应
json
{
    "_id": "69c2a7d754086124ad6a1694",
    "username": "testuser",
    "email": "test@example.com",
    "roles": ["ROLE_USER"],
    "activated": true
}
错误响应格式
401 Unauthorized
json
{
    "error": "Authentication required",
    "title": "Unauthorized",
    "status": 401,
    "message": "No token provided"
}
400 Bad Request
json
{
    "error": "Validation error",
    "message": "Username must be at least 3 characters"
}
404 Not Found
json
{
    "error": "User not found"
}
409 Conflict
json
{
    "error": "Username already exists",
    "message": "Please choose a different username"
}
常见状态码
状态码	说明
200	成功
201	创建成功
400	请求参数错误
401	未认证（缺少或无效 Token）
403	无权限（角色不足）
404	资源不存在
409	资源已存在（冲突）
500	服务器内部错误
测试指南
使用 Apidog 测试
1. 安装 Apidog
访问 https://apidog.com/ 下载并安装

2. 创建环境变量
打开 Apidog → 环境管理

创建新环境 "本地开发"

添加变量：

baseUrl: http://localhost:8000

token: 空

3. 配置自动保存 Token
在登录请求（POST /api/authenticate）的"后置操作"中添加：

javascript
const response = pm.response.json();
if (response.id_token) {
    pm.environment.set("token", response.id_token);
}
4. 使用 Token
在所有需要认证的请求中，Headers 设置：

Key: Authorization

Value: Bearer {{token}}

完整测试用例
测试 1: 用户注册
http
POST {{baseUrl}}/api/register
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com"
}
预期响应: 201 Created

测试 2: 用户登录
http
POST {{baseUrl}}/api/authenticate
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123"
}
预期响应:

json
{
    "id_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "Bearer",
    "expires_in": 86400
}
测试 3: 检查认证状态
http
GET {{baseUrl}}/api/authenticate
Authorization: Bearer {{token}}
预期响应:

json
{
    "authenticated": true,
    "username": "testuser"
}
测试 4: 获取员工列表
http
GET {{baseUrl}}/api/employees
Authorization: Bearer {{token}}
预期响应: 员工数组

测试 5: 创建员工（权限测试）
http
POST {{baseUrl}}/api/employees
Authorization: Bearer {{token}}
Content-Type: application/json

{
    "name": "新员工",
    "job": "工程师"
}
预期响应（普通用户）: 403 Forbidden

测试 6: 无 Token 访问
http
GET {{baseUrl}}/api/employees
预期响应: 401 Unauthorized

使用 curl 测试
登录获取 Token
bash
curl -X POST http://localhost:8000/api/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
使用 Token 访问 API
bash
curl -X GET http://localhost:8000/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
检查认证状态
bash
curl -X GET http://localhost:8000/api/authenticate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
创建员工（管理员）
bash
curl -X POST http://localhost:8000/api/employees \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"管理员创建","job":"CTO"}'
使用 PowerShell 测试
powershell
# 登录
$body = @{username="admin"; password="admin123"} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/authenticate" `
    -Method Post -Body $body -ContentType "application/json"
$token = $response.id_token
Write-Host "Token: $token"

# 获取员工列表
Invoke-RestMethod -Uri "http://localhost:8000/api/employees" `
    -Headers @{Authorization = "Bearer $token"}

# 获取账户信息
Invoke-RestMethod -Uri "http://localhost:8000/api/account" `
    -Headers @{Authorization = "Bearer $token"}

# 检查认证状态
Invoke-RestMethod -Uri "http://localhost:8000/api/authenticate" `
    -Headers @{Authorization = "Bearer $token"}
测试清单
序号	测试项	端点	方法	预期状态码
1	用户注册	/api/register	POST	201
2	用户登录	/api/authenticate	POST	200
3	认证状态检查	/api/authenticate	GET	200
4	获取账户信息	/api/account	GET	200
5	获取员工列表	/api/employees	GET	200
6	创建员工（普通用户）	/api/employees	POST	403
7	创建员工（管理员）	/api/employees	POST	201
8	获取所有用户	/api/users	GET	403
9	获取特定用户	/api/users/username/:username	GET	200
10	无 Token 访问	/api/employees	GET	401
11	无效 Token	/api/employees	GET	401
12	更新员工（管理员）	/api/employees/:id	PUT	200
13	删除员工（管理员）	/api/employees/:id	DELETE	200
常见问题
Q1: 启动时提示端口被占用
解决方案: 修改 .env 文件中的 PORT 值

env
PORT=3001
Q2: MongoDB 连接失败
解决方案:

检查 MongoDB 服务是否运行

bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
检查 .env 中的 DB_URL 是否正确

检查网络连接（如果使用远程数据库）

Q3: JWT Token 验证失败
解决方案:

确保 Token 格式正确：Bearer <token>（注意空格）

检查 Token 是否过期

确认 JWT_SECRET 与生成时一致

检查 Token 是否被截断或包含换行符

Q4: 普通用户无法创建员工
解决方案: 这是正常行为，需要将用户角色设置为 ROLE_ADMIN

Q5: 如何创建管理员用户
解决方案: 通过 MongoDB 命令行或 Compass 更新用户角色

javascript
// 连接到数据库
use my-employees

// 更新用户角色
db.user.updateOne(
    { username: "your-username" },
    { $set: { roles: ["ROLE_USER", "ROLE_ADMIN"] } }
)
Q6: Token 如何刷新
解决方案: 当前实现需要重新登录获取新 Token，可后续添加 refresh token 功能

Q7: 生产环境部署注意事项
使用强 JWT_SECRET（至少 64 位随机字符串）

启用 HTTPS

设置合理的 Token 过期时间

限制 API 请求频率

配置 CORS 策略

使用 PM2 或类似工具管理进程

Q8: 如何查看数据库中的数据
解决方案: 使用 MongoDB Compass 图形化工具

下载安装 MongoDB Compass

连接字符串：mongodb://localhost:27017

选择数据库 my-employees

查看 employees 和 user 集合

Q9: 密码加密原理
解决方案: 使用 bcrypt 加密，每次加密结果不同

javascript
const bcrypt = require('bcryptjs');
const hashedPassword = await bcrypt.hash(password, 10);
const isValid = await bcrypt.compare(password, hashedPassword);
Q10: 如何测试 Token 过期
解决方案: 修改 JWT 配置临时测试

在 src/config/jwt.js 中临时修改：

javascript
expiresIn: 60, // 改为60秒
然后重启应用，登录获取 Token，等待 60 秒后测试

安全建议
1. JWT 密钥管理
不要将密钥提交到版本控制

使用环境变量存储

定期更换密钥

使用强随机字符串（openssl rand -base64 64）

2. 密码安全
使用 bcrypt 加密（salt rounds ≥ 10）

设置密码强度要求（最小长度、包含数字和特殊字符）

禁止使用常见密码

3. Token 安全
设置合理的过期时间（建议 24 小时）

使用 HTTPS 传输

不要在 URL 中传递 Token

实现 Token 黑名单机制（可选）

4. API 安全
实现请求限流（rate limiting）

验证所有输入数据

使用 Helmet 中间件

配置 CORS 白名单

记录所有 API 访问日志

5. 数据库安全
使用强密码

限制数据库访问 IP

定期备份数据

使用 MongoDB 认证

贡献指南
欢迎提交 Issue 和 Pull Request！

提交 Issue 时请包含：
问题描述

错误日志

环境信息（Node.js 版本、MongoDB 版本等）

重现步骤

许可证
MIT License

联系方式
如有问题，请提交 Issue 或联系项目维护者。

最后更新: 2026-03-24
