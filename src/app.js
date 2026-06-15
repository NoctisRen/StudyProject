const express = require('express');

require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const crypto = require('crypto');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const { notFound, errorHandler } = require('./middlewares');

const app = express();

// 视图引擎（EJS 界面）
app.set('view engine', 'ejs');
app.set('views', `${__dirname}/ui-routes/views`);

// 静态文件
app.use(express.static(`${__dirname}/ui-routes/views`));
app.use(express.static(`${__dirname}/ui-routes/public`));

// ===== 安全中间件 =====

// Helmet 安全头（细化配置）
app.use(helmet({
  contentSecurityPolicy: false, // EJS 内联样式可能触发 CSP
  crossOriginEmbedderPolicy: false,
}));

// CORS - 生产环境建议配置白名单
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? (process.env.CORS_ORIGIN || 'http://localhost:8000')
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// 通用 API 限流
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
  },
});
app.use('/api', apiLimiter);

// ===== 通用中间件 =====

// 请求日志（生产环境使用 combined 格式）
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// JSON 请求体解析（Express 内置替代 body-parser）
app.use(express.json());

// 请求追踪 ID — 每个请求分配唯一标识
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID().slice(0, 8);
  res.set('X-Request-Id', req.requestId);
  next();
});

// 自定义 morgan 格式（包含请求追踪 ID）
morgan.token('request-id', (req) => req.requestId || '-');
morgan.token('user-agent-short', (req) => {
  const ua = req.headers['user-agent'] || '';
  return ua.length > 60 ? `${ua.slice(0, 57)}...` : ua;
});
app.use(morgan(
  ':request-id :method :url :status :res[content-length] - :response-time ms',
  { skip: (req) => req.url === '/favicon.ico' },
));

// ===== 路由 =====

app.use('/api', authRoutes);

const employees = require('./routes/employees');
const ui = require('./ui-routes/index');
const users = require('./routes/users');

app.use('/api/employees', employees);
app.use('/api/users', users);
app.use('/ui/employees', ui);

// ===== 错误处理 =====

app.use(notFound);
app.use(errorHandler);

module.exports = app;
