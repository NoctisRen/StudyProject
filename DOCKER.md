# Docker 部署指南

本项目使用 **2 个容器**：
- **`api`**：Express 后端（Node.js 24 + EJS UI）
- **`mongo`**：MongoDB 7 数据库

容器通过同一个 Compose 网络互通：`api` 使用 `mongodb://mongo:27017/my-employees` 连接数据库。

---

## 前置条件

- Docker Engine 24+（或 Docker Desktop）
- Docker Compose v2+

验证命令：

```bash
docker --version
docker compose version
```

---

## 文件说明

| 文件 | 用途 |
|------|------|
| `Dockerfile` | 构建 API 镜像（Node 24 Alpine，生产依赖） |
| `.dockerignore` | 排除 `node_modules`、`.env`、Git 等进镜像 |
| `docker-compose.yml` | 编排 `api` + `mongo`，含健康检查和网络配置 |

---

## 构建并运行

```bash
# 构建并后台启动
docker compose up -d --build

# 查看状态
docker compose ps

# 查看日志
docker compose logs -f api
```

服务启动后：
- API 服务 → `http://localhost:8000`
- MongoDB → `localhost:27017`

---

## 验证部署

### 检查连通性（返回 401 是正常的，说明服务可访问）

```bash
curl -s http://localhost:8000/api/authenticate
# → {"error":"Authentication required",...}
```

### 注册用户

```bash
curl -s -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123","email":"test@example.com"}'
```

### 登录获取 Token

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).id_token")
echo "$TOKEN"
```

### 访问员工 API

```bash
curl -s http://localhost:8000/api/employees \
  -H "Authorization: Bearer $TOKEN"
```

### 创建员工（需要管理员权限）

```bash
# 先将用户提升为管理员
docker exec -it express-api-mongo mongosh my-employees \
  --eval 'db.user.updateOne({username:"testuser"},{$set:{roles:["ROLE_USER","ROLE_ADMIN"]}})'

# 重新登录获取 Token
TOKEN=$(curl -s -X POST http://localhost:8000/api/authenticate \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}' | node -pe "JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).id_token")

# 创建员工
curl -s -X POST http://localhost:8000/api/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Docker 测试员工","job":"工程师"}'
```

---

## 停止容器

```bash
# 停止并删除容器
docker compose down

# 同时删除 MongoDB 数据
docker compose down -v
```

---

## 常用排查询

```bash
# 查看容器状态
docker compose ps

# 查看 API 日志
docker compose logs -f api

# 进入 MongoDB 容器
docker exec -it express-api-mongo mongosh

# 查看 API 容器环境变量
docker exec express-api env | sort
```

---

## CI 集成

每次 push 到主分支，GitHub Actions 会自动构建 Docker 镜像验证正确性。详见 `.github/workflows/ci.yml` 中的 `docker-build` job。
