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
  const results = runEsprint(path.join(__dirname, '../folder/'));
  const expectedError = expect.stringContaining('2 problems (2 errors, 0 warnings)');
  expect(results.error).toBeDefined();
  expect(results.error.stdout.toString()).toEqual(expectedError);
  expect(getPid()).toBeDefined();
});

test('Properly lints and returns errors without server', () => {
  const results = runEsprint(path.join(__dirname, '../folder/'), 'check');
  const expectedError = expect.stringContaining('2 problems (2 errors, 0 warnings)');
  expect(results.error).toBeDefined();
  expect(results.error.stdout.toString()).toEqual(expectedError);
  expect(getPid()).toBeUndefined();
});
