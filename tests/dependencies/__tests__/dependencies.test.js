const fs = require('fs');
const path = require('path');
const runEsprint = require('../../runEsprint.js');
const killProcess = require('../../killProcess.js');

const FIXTURE_DIR = path.join(__dirname, '..');
const FIXTURE_1_PATH = path.join(FIXTURE_DIR, 'fixture.js')
const FIXTURE_2_PATH = path.join(FIXTURE_DIR, 'fixture2.js')

function writeStartingFileContents() {
  const file1Contents = `import { foo } from './fixture2';\nfoo(5);`;
  const file2Contents = `import getPid from '../getPid';\n\nconst bar = (x) => console.log(x);`;

  if (!fs.existsSync(FIXTURE_1_PATH)) {
    fs.writeFileSync(FIXTURE_1_PATH, file1Contents);
  }
  fs.writeFileSync(FIXTURE_2_PATH, file2Contents);
}

function writeFile2ContentsWithExport() {
  const file2Contents = `export const foo = (x) => console.log(x);`;
  fs.writeFileSync(FIXTURE_2_PATH, file2Contents);
}

beforeEach(() => {
  killProcess();
  writeStartingFileContents();
});

afterEach(() => {
  killProcess();
  writeStartingFileContents();
});

test('Properly updates when a dependency updates', () => {
  const results = runEsprint(FIXTURE_DIR);
  const expectedError = expect.stringContaining(`error  foo not found in './fixture2'  import/named`);
  expect(results.error).toBeDefined();
  expect(results.error.stdout.toString()).toEqual(expectedError);

  writeFile2ContentsWithExport();
  const newResults = runEsprint(FIXTURE_DIR);
  const newExpectedResults = expect.stringContaining('');
  expect(newResults.error).toBeUndefined();
});
