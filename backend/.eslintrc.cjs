module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  extends: ['airbnb', 'prettier'],
  globals: {
    module: true,
    process: true,
  },
  plugins: ['import', 'unused-imports'],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  rules: {
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'always',
      },
    ],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': ['warn', { args: 'none' }],
    'no-else-return': 'off',
    'no-await-in-loop': 'off',
    'no-restricted-syntax': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'airbnb',
        'prettier',
        'plugin:@typescript-eslint/recommended',
      ],
      settings: {
        'import/resolver': {
          typescript: {},
          node: {
            extensions: ['.js', '.ts'],
          },
        },
      },
      rules: {
        'import/extensions': [
          'error',
          'ignorePackages',
          {
            js: 'always',
            ts: 'never',
          },
        ],
        'unused-imports/no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
      },
    },
  ],
};