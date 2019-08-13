const path = require('path');
const fs = require('fs');
const runEsprint = require('../../runEsprint.js');
const killProcess = require('../../killProcess.js');
const getPid = require('../../getPid.js');

const utf8 = 'utf8';
const fixture = path.join(__dirname, '../fixture.js');
let fixtureContents;

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
  fixtureContents = fs.readFileSync(fixture, utf8);
});

afterEach(() => {
  killProcess();
  fs.writeFileSync(fixture, fixtureContents, utf8);
});

test('Fixes lint errors with server', () => {
  const results = runEsprint(path.join(__dirname, '..'), '--fix');
  expect(results.error).toBeUndefined();
  expect(fixtureContents).not.toEqual(fs.readFileSync(fixture, utf8));
  expect(getPid()).toBeDefined();
});

test('Fixes lint errors without server', () => {
  const results = runEsprint(path.join(__dirname, '..'), 'check --fix');
  expect(results.error).toBeUndefined();
  expect(fixtureContents).not.toEqual(fs.readFileSync(fixture, utf8));
  expect(getPid()).toBeUndefined();
});
