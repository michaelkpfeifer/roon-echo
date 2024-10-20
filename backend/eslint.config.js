import pluginJs from '@eslint/js';
import airbnbBase from 'eslint-config-airbnb-base';
import prettierConfig from 'eslint-config-prettier';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        browser: 'readonly',
        node: 'readonly',
      },
    },

    rules: {
      ...airbnbBase.rules,
      ...prettierConfig.rules,
      semi: ['error', 'always'], // Enforce semicolons at the end of lines
      'padding-line-between-statements': [
        'error',
        { blankLine: 'never', prev: '*', next: 'import' }, // No blank lines before import statements
        { blankLine: 'never', prev: 'directive', next: '*' }, // No blank lines after directives
      ],
      'key-spacing': [
        'error',
        {
          beforeColon: false, // No spaces before the colon
          afterColon: true, // One space after the colon
          mode: 'strict', // Enforce strict spacing rules
        },
      ],
      camelcase: [
        'error',
        {
          properties: 'always', // Enforce camelCase for object property names as well
          ignoreDestructuring: false, // Enforce camelCase even in destructured assignments
          ignoreImports: false, // Enforce camelCase in import statements
          ignoreGlobals: false, // Enforce camelCase for global variables as well
        },
      ],
      quotes: [
        'error',
        'single',
        { avoidEscape: true, allowTemplateLiterals: true },
      ],
    },
  },
];
