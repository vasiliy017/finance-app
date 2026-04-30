// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/components', '@/components/*'],
              message: 'The legacy root components directory was removed. Use @/shared/ui or @/app/components instead.',
            },
          ],
          paths: [
            {
              name: '@/components/themed-text',
              message: 'Use @/shared/ui instead.',
            },
            {
              name: '@/components/themed-view',
              message: 'Use @/shared/ui instead.',
            },
            {
              name: '@/hooks/use-color-scheme',
              message: 'Use @/shared/hooks instead.',
            },
            {
              name: '@/hooks/use-theme-color',
              message: 'Use @/shared/hooks instead.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/ui/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/shared/ui', '@/shared/ui/*'],
              message: 'Use relative imports inside src/shared/ui.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/hooks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/shared/hooks', '@/shared/hooks/*'],
              message: 'Use relative imports inside src/shared/hooks.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/shared/config/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/shared/config', '@/shared/config/*'],
              message: 'Use relative imports inside src/shared/config.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/entities/transaction/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/entities/transaction', '@/entities/transaction/*'],
              message: 'Use relative imports inside src/entities/transaction.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/add-transaction/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/features/add-transaction/model/*',
                '@/features/add-transaction/ui/*',
              ],
              message: 'Use relative imports inside src/features/add-transaction.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/transaction-list/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/transaction-list/ui/*'],
              message: 'Use relative imports inside src/features/transaction-list.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/entities/**/*.{ts,tsx}',
      'src/features/**/*.{ts,tsx}',
      'src/screens/**/*.{ts,tsx}',
      'src/shared/**/*.{ts,tsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/app', '@/app/*'],
              message: 'Do not import app-shell code into non-router src modules. Keep routing adapters and tab-shell components inside src/app only.',
            },
          ],
        },
      ],
    },
  },
]);
