// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  testEnvironment: 'jsdom',
  clearMocks: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy'
  },
  automock: false,
  setupFiles: [
    './setupTests.js'
  ],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest']
  }
}
