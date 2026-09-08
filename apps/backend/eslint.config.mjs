// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import eslintComments from 'eslint-plugin-eslint-comments';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', '**/*.tmp'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,
  {
    languageOptions: {
      sourceType: 'commonjs',
    },
    plugins: {
      'eslint-comments': eslintComments,
    },
    rules: {
      // TODO(deuda): subir a 'error' cuando se limpien los ~154 `any` existentes (ver docs/convenciones-codigo.md)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'eslint-comments/no-use': ['error', { allow: [] }],
      'max-lines': [
        'error',
        { max: 400, skipBlankLines: true, skipComments: true },
      ],
      'max-lines-per-function': [
        'error',
        { max: 80, skipBlankLines: true, skipComments: true },
      ],
    },
  },
  {
    files: ['**/*.spec.ts', 'prisma/seed.ts', 'prisma/reset-admin.ts'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off',
      // jest.isolateModules() necesita require() dinámico y síncrono para
      // re-importar un módulo con env vars distintas — un import estático de
      // ESM no sirve acá, no es un descuido.
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
);
