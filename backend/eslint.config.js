const airbnbBase = require('eslint-config-airbnb-base');

module.exports = [
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
          afterColon: true,   // One space after the colon
          mode: 'strict',     // Enforce strict spacing rules
        },
      ],
    },
  }
];
