module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Possible Problems
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'off', // Allow console.log in server applications

    // Suggestions
    'prefer-const': 'error',
    'no-var': 'error',

    // Layout & Formatting
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'comma-dangle': ['error', 'never'],
    'eol-last': ['error', 'always'],
    'no-trailing-spaces': 'error',

    // Node.js specific
    'no-process-exit': 'off', // Allow process.exit in server code
    'global-require': 'off'
  },
  ignorePatterns: [
    'node_modules/',
    'coverage/',
    'uploads/',
    'logs/',
    '*.log'
  ]
};
