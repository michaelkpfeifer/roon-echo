export default {
  preset: 'ts-jest',
  testEnvironment: 'node',  transform: {},
  coveragePathIgnorePatterns: [
    '/__factories__/',
    '/__fixtures__/',
    '/__tests__/',
  ],
};
