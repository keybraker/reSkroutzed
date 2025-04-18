module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
        'prettier',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:prettier/recommended',
    ],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        project: './tsconfig.json',
    },
    env: {
        browser: true,
        es6: true,
        webextensions: true,
    },
    rules: {
        // Generic JS/TS rules
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
        'no-unused-vars': 'off', // Using TypeScript's version
        '@typescript-eslint/no-unused-vars': ['warn', {
            'argsIgnorePattern': '^_',
            'varsIgnorePattern': '^_',
            'ignoreRestSiblings': true
        }],
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',

        // Prettier integration
        'prettier/prettier': 'error',

        // Browser extension specific rules
        'no-restricted-globals': ['error', 'event', 'name'],
    },
    overrides: [
        {
            // Handle specific file patterns
            files: ['*.ts'],
            rules: {
                '@typescript-eslint/explicit-function-return-type': ['warn', {
                    allowExpressions: true,
                    allowTypedFunctionExpressions: true,
                }],
            },
        },
    ],
};