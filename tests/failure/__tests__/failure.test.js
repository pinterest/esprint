const path = require('path');
const runEsprint = require('../../runEsprint.js');
const killProcess = require('../../killProcess.js');

expect.addSnapshotSerializer({
  print(val, serialize, indent) {
    return val.replace(/(.*)(esprint\/tests)/,'/-snip-/$2');
  },
  test(val) {
    return val.indexOf('/esprint/tests/') >= 0;
  },
});

beforeEach(() => {
  killProcess();
});

afterEach(() => {
  killProcess();
});

test('Properly lints and returns errors', () => {
  const results = runEsprint(path.join(__dirname, '..'));
  const expectedError = expect.stringContaining('error  Unexpected var, use let or const instead  no-var');
  expect(results.error).toBeDefined();
  expect(results.error.stdout.toString()).toEqual(expectedError);
});
