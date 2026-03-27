# Docker 部署与验证（Express API + MongoDB）

仓库链接（按作业要求）：`https://github.com/zagaris/express-api`

本项目使用 **2 个容器**（B 方案）：
- **`api`**：Express 后端（同时提供 EJS UI）
- **`mongo`**：MongoDB 数据库

容器通过同一个 Compose 网络互通：`api` 使用 `mongodb://mongo:27017/my-employees` 连接数据库。

---

## 1) 安装与环境检查（Windows）

你需要安装并启动 Docker Desktop（建议启用 WSL2 后端）。

验证命令（PowerShell）：

```powershell
wsl --status
docker --version
docker compose version
```

如果出现 **`Docker Desktop is unable to start`**：
- 确认 Docker Desktop 已打开且右下角状态为 **Running**
- 在 Docker Desktop Settings 里确认使用 **WSL2 backend**
- 重启 Docker Desktop / 重启电脑后再试

---

## 2) 项目里新增/使用的 Docker 文件

根目录文件：
- **`Dockerfile`**：构建并运行后端（镜像内 `npm ci --omit=dev`，启动 `node src/server.js`）
- **`.dockerignore`**：避免把 `node_modules`、`.env` 等打进镜像
- **`docker-compose.yml`**：编排 `api` + `mongo` 两容器、网络、数据卷、健康检查

---

## 3) 构建并运行两个容器

在仓库根目录执行：

```powershell
docker compose up -d --build
```

说明：
- `mongo` 会暴露到本机 `27017`（便于你用 Compass 连接调试）
- `api` 会暴露到本机 `8000`
- `mongo` 有健康检查，`api` 会等 `mongo` healthy 后启动

---

## 4) 检查应用是否运行正常

### 4.1 查看容器状态

```powershell
docker compose ps
```

你应看到两个服务：`api`、`mongo` 都是 Up。

### 4.2 查看日志（分别检查两个容器）

```powershell
docker compose logs -f mongo
docker compose logs -f api
```

### 4.3 基础连通性检查

```powershell
Invoke-WebRequest -UseBasicParsing http://localhost:8000/api/authenticate
```

说明：该接口需要 token，会返回 401（这是正常的），关键是确认 **服务可访问**。

---

## 5) 最小端到端接口测试（PowerShell）

### 5.1 注册

```powershell
$body = @{ username = "testuser_docker"; password = "password123"; email = "testuser_docker@example.com" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/register" -Method Post -Body $body -ContentType "application/json"
```

### 5.2 登录获取 Token

```powershell
$loginBody = @{ username = "testuser_docker"; password = "password123" } | ConvertTo-Json
$loginResp = Invoke-RestMethod -Uri "http://localhost:8000/api/authenticate" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResp.id_token
```

### 5.3 访问受保护资源（示例）

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/employees" -Headers @{ Authorization = "Bearer $token" }
```

如果你需要验证管理员权限（创建员工/删改），需要把该用户在 MongoDB 中提升为 `ROLE_ADMIN`（见 README 的说明），或直接用数据库更新：

```powershell
docker exec -it express-api-mongo mongosh my-employees --eval "db.user.updateOne({username:'testuser_docker'}, {\$set: {roles:['ROLE_USER','ROLE_ADMIN']}})"
```

然后重新登录获取 token，再调用创建员工接口：

```powershell
$token = (Invoke-RestMethod -Uri "http://localhost:8000/api/authenticate" -Method Post -Body $loginBody -ContentType "application/json").id_token
$empBody = @{ name = "Docker Emp"; job = "Engineer" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/employees" -Method Post -Body $empBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" }
```

---

## 6) 停止容器运行

```powershell
docker compose down
```

如需同时删除 MongoDB 数据卷（清空数据）：

```powershell
docker compose down -v
```

---

## 7) 常用排查命令（按“两个容器”区分）

```powershell
# 看状态
docker compose ps

# 分别看日志
docker compose logs -f mongo
docker compose logs -f api

# 进入 mongo 容器
docker exec -it express-api-mongo mongosh

# 在 api 容器内查看环境变量（确认 DB_URL/JWT_SECRET）
docker exec -it express-api sh -lc "env | sort"
```

