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

test('Server is properly killed after the stop command', () => {
  runEsprint(path.join(__dirname, '..'));
  expect(getPid()).toBeDefined();
  runEsprint(path.join(__dirname, '..'), 'stop');
  expect(getPid()).toBeUndefined();
});
