module.exports = {
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  extends: ['airbnb', 'prettier', 'plugin:react/recommended'],
  globals: {
    module: true,
    process: true,
  },
  plugins: ['import', 'react-hooks', 'unused-imports'],
  ignorePatterns: ['*.svg'],
  rules: {
    'no-else-return': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
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
    'import/prefer-default-export': 'off',
  },
};
