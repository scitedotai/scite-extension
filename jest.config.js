// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '\\.css$': 'identity-obj-proxy'
  },
  automock: false,
  setupFiles: [
    './setupTests.js'
  ]
}
