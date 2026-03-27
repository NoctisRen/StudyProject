/* eslint-disable consistent-return */
const express = require('express');
const { employeeSchema } = require('../db/schema');  // 修改：使用解构赋值
const db = require('../db/connection');
const { authenticateJWT, authorize } = require('../middlewares/auth');  // 新增

const employees = db.get('employees');

const router = express.Router();

// 保护所有员工路由 - 需要认证
router.use(authenticateJWT);

/* Get all employees */
router.get('/', async (req, res, next) => {
  try {
    const allEmployees = await employees.find({});
    res.json(allEmployees);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
});

/* Get all distinct job values */
router.get('/jobs', async (req, res, next) => {
  try {
    const jobs = await employees.distinct('job');
    res.json(jobs);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
});

/* Get a specific employee */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await employees.findOne({
      _id: id,
    });

    if (!employee) {
      const error = new Error('Employee does not exist');
      error.statusCode = 404;
      return next(error);
    }

    res.json(employee);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
});

/* Create a new employee - 需要管理员权限 */
router.post('/', authorize('ROLE_ADMIN'), async (req, res, next) => {
  try {
    const { name, job } = req.body;
    await employeeSchema.validateAsync({ name, job });  // 修改：使用 employeeSchema

    const employee = await employees.findOne({
      name,
    });

    // Employee already exists
    if (employee) {
      const error = new Error('Employee already exists');
      error.statusCode = 409; // conflict error
      return next(error);
    }

    const newuser = await employees.insert({
      name,
      job,
    });

    res.status(201).json(newuser);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
});

/* Update a specific employee - 需要管理员权限 */
router.put('/:id', authorize('ROLE_ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, job } = req.body;
    const result = await employeeSchema.validateAsync({ name, job });  // 修改：使用 employeeSchema
    const employee = await employees.findOne({
      _id: id,
    });

    // Employee does not exist
    if (!employee) {
      return next();
    }

    const updatedEmployee = await employees.update({
      _id: id,
    }, { $set: result },
    { upsert: true });

    res.json(updatedEmployee);
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
});

/* Delete a specific employee - 需要管理员权限 */
router.delete('/:id', authorize('ROLE_ADMIN'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await employees.findOne({
      _id: id,
    });

    // Employee does not exist
    if (!employee) {
      return next();
    }
    await employees.remove({
      _id: id,
    });

    res.json({
      message: 'Employee has been deleted',
    });
  } catch (error) {
    error.statusCode = error.statusCode || 500;
    next(error);
  }
});

module.exports = router;