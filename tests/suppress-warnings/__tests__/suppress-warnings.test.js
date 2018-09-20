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
  const unexpectedError = expect.stringContaining('warning  Unexpected var, use let or const instead  no-var');
  expect(results.error).toBeUndefined();
  expect(results.stdout.toString()).not.toEqual(unexpectedError);
  expect(getPid()).toBeDefined();
});

test('Properly lints and returns errors without server', () => {
  const results = runEsprint(path.join(__dirname, '..'), 'check');
  const unexpectedError = expect.stringContaining('warning  Unexpected var, use let or const instead  no-var');
  expect(results.error).toBeUndefined();
  expect(results.stdout.toString()).not.toEqual(unexpectedError);
  expect(getPid()).toBeUndefined();
});
