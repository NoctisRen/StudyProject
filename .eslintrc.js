module.exports = {
  env: {
    commonjs: true,
    es2020: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'linebreak-style': 'off',
    'no-console': 'off',
    indent: ['error', 2],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-unused-vars': ['warn'],
    'max-len': ['error', { code: 100 }],
    'quote-props': ['error', 'as-needed'],
    'comma-dangle': ['error', 'always-multiline'],
    // MongoDB _id 字段是标准命名，允许
    'no-underscore-dangle': 'off',
    // Express 中间件需要 return next() 有时多个分支return
    'consistent-return': 'off',
  },
};
