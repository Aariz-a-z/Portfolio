import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescriptConfig from 'eslint-config-next/typescript';

/**
 * Flat config consumed directly from eslint-config-next.
 *
 * Not routed through `FlatCompat`: eslint-config-next 16 ships real flat
 * configs, and passing them back through the eslintrc compatibility layer makes
 * ESLint 9 fail while serialising the react plugin's self-referential config
 * object ("Converting circular structure to JSON").
 */
const eslintConfig = [
  ...coreWebVitals,
  ...typescriptConfig,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'scripts/**',
      'public/**',
      'verification/**',
      'next-env.d.ts',
    ],
  },
];

export default eslintConfig;
