const globals = require('globals')
const tseslint = require('typescript-eslint')

// React-focused plugins (optional but helpful in a React/TS codebase)
const reactHooks = require('eslint-plugin-react-hooks')
const reactRefresh = require('eslint-plugin-react-refresh')

module.exports = [
  // Prevent ESLint from scanning generated build artifacts and non-source files.
  {
    ignores: [
      'dist/**',
      '**/dist/**',
      'node_modules/**',
      '**/*.html',
      '**/eslint.config.*',
    ],
  },

  // TypeScript rules
  ...tseslint.configs.recommended,

  // React-specific rules (applies to TS/TSX and JS/JSX)
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Recommended rules for correct hooks usage
      ...reactHooks.configs.recommended.rules,
      // React Refresh prefers components exported as constants
      'react-refresh/only-export-components': 'warn',
    },
  },
]

