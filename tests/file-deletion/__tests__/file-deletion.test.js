const path = require('path');
const fs = require('fs');
const runEsprint = require('../../runEsprint.js');
const killProcess = require('../../killProcess.js');

function writeFileContents() {
  const fileContents = `var x = 0;\nconsole.log(x);`
  
  if (!fs.existsSync(path.join(__dirname, '..', 'fixture.js'))) {
    fs.writeFileSync(path.join(__dirname, '..', 'fixture.js'), fileContents);
  }
}

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
  writeFileContents();
});

afterEach(() => {
  killProcess();
  writeFileContents();
});

test('Properly updates the cache upon deleting a file', () => {
  const results = runEsprint(path.join(__dirname, '..'));
  const expectedError = expect.stringContaining('error  Unexpected var, use let or const instead  no-var');
  expect(results.error).toBeDefined();
  expect(results.error.stdout.toString()).toEqual(expectedError);

  fs.unlinkSync(path.join(__dirname, '..', 'fixture.js'));
  const newResults = runEsprint(path.join(__dirname, '..'));
  const newExpectedResults = expect.stringContaining('');
  expect(newResults.error.stdout.toString()).toEqual(newExpectedResults);
});