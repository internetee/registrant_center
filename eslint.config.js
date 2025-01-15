import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-plugin-prettier';
import airbnb from 'eslint-config-airbnb';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
    { ignores: ['**/dist/**', '**/node_modules/**', '**/build/**', '**/coverage/**'] },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
                cy: 'readonly',
                Cypress: 'readonly',
            },
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
            prettier,
            'jsx-a11y': jsxA11y,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,
            ...airbnb.rules,
            camelcase: 0,
            'react/style-prop-object': 0,
            'global-require': 0,
            'import/newline-after-import': 0,
            'import/no-dynamic-require': 0,
            'import/no-extraneous-dependencies': 0,
            'jsx-a11y/anchor-is-valid': ['error'],
            'no-console': 0,
            'no-duplicate-imports': 0,
            'no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_', // Ignore params starting with underscore
                    varsIgnorePattern: '^_', // Ignore variables starting with underscore
                    caughtErrorsIgnorePattern: '^_', // Ignore caught errors starting with underscore
                },
            ],
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
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            semi: ['error', 'always'],
        },
    },
];
