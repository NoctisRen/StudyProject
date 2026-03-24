const express = require('express');

require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const authRoutes = require('./routes/auth');

const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { notFound, errorHandler, timeSign } = require('./middlewares');

const app = express();

console.log(`${__dirname}/ui-routes/views`);

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/ui-routes/views`);
app.use(express.static(`${__dirname}/ui-routes/views`));

app.use(express.static(`${__dirname}/ui-routes/public`));

app.use(helmet());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(timeSign);

// 注册认证路由（必须在其他路由之前）
app.use('/api', authRoutes);

const employees = require('./routes/employees');
const ui = require('./ui-routes/index');
const users = require('./routes/users');

app.use('/api/employees', employees);
app.use('/api/users', users);

app.use('/ui/employees', ui);

app.use(notFound);
app.use(errorHandler);

module.exports = app;