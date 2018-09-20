const path = require('path');
const runEsprint = require('../../runEsprint.js');
const killProcess = require('../../killProcess.js');
const getPid = require('../../getPid.js');

beforeEach(() => {
  killProcess();
});

afterEach(() => {
  killProcess();
});

test('Properly lints and returns errors with server', () => {
  const results = runEsprint(path.join(__dirname, '..'));
  const expectedError = expect.stringContaining('warning  Unexpected var, use let or const instead  no-var');
  expect(results.error).toBeDefined();
  expect(results.error.stdout.toString()).toEqual(expectedError);
  expect(getPid()).toBeDefined();
});

test('Properly lints and returns errors without server', () => {
  const results = runEsprint(path.join(__dirname, '..'), 'check');
  const expectedError = expect.stringContaining('warning  Unexpected var, use let or const instead  no-var');
  expect(results.error).toBeDefined();
  expect(results.error.stdout.toString()).toEqual(expectedError);
  expect(getPid()).toBeUndefined();
});
