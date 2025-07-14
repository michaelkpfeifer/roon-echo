export default {
  preset: 'ts-jest',
  testEnvironment: 'node',

  extensionsToTreatAsEsm: ['.ts'],

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  coveragePathIgnorePatterns: [
    '/__factories__/',
    '/__fixtures__/',
    '/__tests__/',
  ],

  transform: {
    '^.+\\.ts$': ['ts-jest', { useESM: true }],
  },
};
