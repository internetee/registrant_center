module.exports = {
  rootDir: '../../',
  setupTestFrameworkScriptFile: './test/unit-test/jest.unit-test.init.js',
  snapshotSerializers: ['enzyme-to-json/serializer'],
  testPathIgnorePatterns: [
    '/config/', // skip the test.js config file
    '/node_modules/'
  ],
  setupFiles: ['dotenv/config']
};