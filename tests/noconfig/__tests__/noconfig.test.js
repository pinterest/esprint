const path = require('path');
const runEsprint = require('../../runEsprint.js');

test('Expect error due to no config', () => {
  const results = runEsprint(path.join(__dirname, '..'));
  expect(results.error).toBeDefined();
});