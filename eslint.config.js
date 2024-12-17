import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-plugin-prettier'
import airbnb from 'eslint-config-airbnb'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...airbnb.rules,
      'camelcase': 0,
      'react/style-prop-object': 0,
      'global-require': 0,
      'import/newline-after-import': 0,
      'import/no-dynamic-require': 0,
      'import/no-extraneous-dependencies': 0,
      'jsx-a11y/anchor-is-valid': ['error'],
      'no-console': 0,
      'no-duplicate-imports': 0,
      'one-var': 0,
      'prettier/prettier': ['error'],
      'react/forbid-prop-types': [0, { checkChildContextTypes: false }],
      'react/jsx-filename-extension': [1, { extensions: ['.jsx'] }],
      'react/jsx-props-no-spreading': 0,
      'react/jsx-sort-props': ['error'],
      'react/prop-types': 0,
      'react/sort-comp': ['error'],
      'object-literal-sort-keys': 0,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
