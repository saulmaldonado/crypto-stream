module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['reflect-metadata'],
  coveragePathIgnorePatterns: ['/node_modules/', '<rootDir>/src/utils/redis.*.ts'],
};
