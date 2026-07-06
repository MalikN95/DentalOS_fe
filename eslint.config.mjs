import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import { configs, plugins } from 'eslint-config-airbnb-extended';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Airbnb base (JS)
  js.configs.recommended,
  plugins.stylistic,
  plugins.importX,
  ...configs.base.recommended,
  // Airbnb React + Next
  ...configs.next.recommended,
  // Airbnb TypeScript
  plugins.typescriptEslint,
  ...configs.base.typescript,
  ...configs.next.typescript,
  // Prettier must come last to disable conflicting stylistic rules
  prettierConfig,
  {
    rules: {
      // App Router requires default exports only for pages/layouts (see override below)
      'import-x/prefer-default-export': 'off',
      // Arrow-function components per project style
      'react/function-component-definition': [
        'error',
        { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
      ],
      'react/require-default-props': 'off',
      'react/jsx-props-no-spreading': 'off',
      // Project convention: type aliases instead of interfaces
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      // Redux Toolkit slices mutate draft state via Immer
      'no-param-reassign': [
        'error',
        { props: true, ignorePropertyModificationsFor: ['state'] },
      ],
      'import-x/no-extraneous-dependencies': [
        'error',
        { devDependencies: ['**/*.test.{ts,tsx}', '**/*.config.{ts,mjs}'] },
      ],
    },
  },
  {
    // Next.js App Router special files must use default export
    files: [
      'src/app/**/page.tsx',
      'src/app/**/layout.tsx',
      'src/app/**/loading.tsx',
      'src/app/**/error.tsx',
      'src/app/**/not-found.tsx',
      'src/app/**/template.tsx',
      'src/app/**/default.tsx',
      'src/middleware.ts',
      '*.config.{ts,mjs}',
    ],
    rules: {
      'import-x/no-default-export': 'off',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
