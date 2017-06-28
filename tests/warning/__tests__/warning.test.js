const path = require('path');
const runEsprint = require('../../runEsprint.js');
const killProcess = require('../../killProcess.js');
const getPid = require('../../getPid.js');

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

test('Properly lints and returns errors with server', () => {
  const results = runEsprint(path.join(__dirname, '..'));
  const expectedError = expect.stringContaining('warning  Unexpected var, use let or const instead  no-var');
  expect(results.error).toBeUndefined();
  expect(results.stdout.toString()).toEqual(expectedError);
  expect(getPid()).toBeDefined();
});

test('Properly lints and returns errors without server', () => {
  const results = runEsprint(path.join(__dirname, '..'), 'check');
  const expectedError = expect.stringContaining('warning  Unexpected var, use let or const instead  no-var');
  expect(results.error).toBeUndefined();
  expect(results.stdout.toString()).toEqual(expectedError);
  expect(getPid()).toBeUndefined();
});
