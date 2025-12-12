module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:import/recommended', 'prettier'],
  env: { node: true, es2020: true, jest: true },
  rules: {
    'import/order': ['error', { 'newlines-between': 'always' }],
  },
};
