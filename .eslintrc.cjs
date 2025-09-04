module.exports = {
    env: {
        browser: true,
        es2020: true,
        node: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'airbnb',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
        },
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    plugins: [
        'react',
        'react-hooks',
        'react-refresh',
        'prettier',
        'jsx-a11y',
    ],
    rules: {
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
    ignorePatterns: ['**/dist/**', '**/node_modules/**', '**/build/**', '**/coverage/**'],
};
