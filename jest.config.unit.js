module.exports = {
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.test.json',
      babelConfig: {},
    },
  },
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  moduleNameMapper: {},
  testRegex: '\\.test\\.ts?$',
  setupFiles: [],
  setupFilesAfterEnv: [],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.ts',
    '!**/src/**/*.test.ts',
    '!**/src/error/logger.ts',
    '!**/src/**/index.ts',
    '!**/src/datatype/base.ts'
  ],
  coverageDirectory: 'coverage',
  moduleDirectories: ['node_modules', 'src'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
