const Joi = require('joi');

// 员工验证 Schema（原有）
const employeeSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(30)
    .required(),
  job: Joi.string()
    .min(3)
    .max(30)
    .required(),
});

// 用户验证 Schema（新增）
const userSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username cannot exceed 50 characters',
      'any.required': 'Username is required',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Invalid email format',
      'any.required': 'Email is required',
    }),
  roles: Joi.array()
    .items(Joi.string())
    .default(['ROLE_USER'])
    .messages({
      'array.base': 'Roles must be an array of strings',
    }),
  activated: Joi.boolean()
    .default(true),
  langKey: Joi.string()
    .default('en'),
  createdBy: Joi.string()
    .default('system'),
  createdDate: Joi.date()
    .default(Date.now),
  lastModifiedBy: Joi.string(),
  lastModifiedDate: Joi.date(),
});

// 登录验证 Schema（用于 /api/authenticate）
const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// 导出所有 schema
module.exports = {
  employeeSchema,
  userSchema,
  loginSchema,
};
