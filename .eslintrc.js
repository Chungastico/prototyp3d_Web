// .eslintrc.js
module.exports = {
    parser: '@typescript-eslint/parser', // Usa el parser de TypeScript
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true, // Si usas React
        },
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        // Aquí puedes definir tus reglas personalizadas
        semi: ['error', 'always'],
        quotes: ['error', 'single'],
        indent: ['error', 4],
    },
};
