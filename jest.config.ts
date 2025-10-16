/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__test__/**/*.test.ts'], // path ke test Anda
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};