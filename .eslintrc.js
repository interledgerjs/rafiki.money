module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['plugin:jest/recommended', 'standard-with-typescript', 'prettier/@typescript-eslint'],
  plugins: ['@typescript-eslint', 'jest', 'react-hooks', 'react', 'import'],
  env: {
    node: true,
    jest: true,
    browser: true,
    'jest/globals': true,
  },
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json', './packages/*/tsconfig.json'],
  },
  globals: {
    BigInt: true,
  },
  rules: {
    'require-atomic-updates': ['off'],
    camelcase: ['off'],
    '@typescript-eslint/camelcase': ['error', { properties: 'never' }],
    '@typescript-eslint/indent': ['error', 2],
    '@typescript-eslint/explicit-function-return-type': ['off'],
    '@typescript-eslint/explicit-member-accessibility': ['off'],
    '@typescript-eslint/strict-boolean-expressions': ['off'],
    '@typescript-eslint/no-empty-interface': ['off'],
    '@typescript-eslint/no-unused-vars': ['off'],
    '@typescript-eslint/member-delimiter-style': ['off'],
  },
}
