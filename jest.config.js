module.exports = {
  moduleFileExtensions: [
    'js',
    'jsx',
    'json',
    'vue'
  ],
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.jsx?$': 'babel-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  "setupFiles": [
    "<rootDir>/tests/unit/setup"
  ],
  "setupTestFrameworkScriptFile": "<rootDir>/tests/unit/matchers",
  snapshotSerializers: [
    'jest-serializer-vue'
  ],
  testMatch: [
    '**/tests/unit/**/*.spec.(js|jsx|ts|tsx)|**/__tests__/*.(js|jsx|ts|tsx)'
  ],
  testURL: 'http://localhost/',

  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,vue}",
    "!tests/**"
  ],
  coverageDirectory: '<rootDir>/target'
};

