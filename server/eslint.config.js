module.exports = [
  {
    files: ['src/**/*.ts', 'src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    parserOptions: {
      project: './tsconfig.json',
      tsconfigRootDir: __dirname,
    },
    plugins: ['@typescript-eslint'],
    extends: [
      'eslint:recommended',
      '@typescript-eslint/recommended',
      '@typescript-eslint/recommended-requiring-type-checking',
      'plugin:prettier/recommended',
    ],
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'prefer-const': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-empty-interface': 'warn',
      'prettier/prettier': 'error',
    },
    ignorePatterns: ['dist/', 'node_modules/'],
  },
];
