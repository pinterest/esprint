// Creates a test directory with all relevant fixtures for writing tests
// Usage: yarn run create-test [test-name]

const path = require("path");
const fs = require("fs");
const argv = require("yargs").argv;

const testName = argv._[0];
const testFile = `${testName}.test.js`;
const testFolder = `__tests__`;

const imports = `
const path = require('path');
const runEsprint = require('../../runEsprint.js');
const killProcess = require('../../killProcess.js');
`;

const hooks = `
beforeEach(() => {
  killProcess();
});

afterEach(() => {
  killProcess();
});
`;

const esprintrc = `
{
  "port": 5004 ,
  "paths": [
    "fixture.js"
  ],

  "ignored": [
    "**/node_modules/**/*"
  ]
}
`;

const eslintrc = `{
  "rules": {
    "no-var": 2
  },
  "env": {
    "es6": true
  },
  "root": true
}
`;

const files = {
  fixture: {
    name: "fixture.js",
    content: "var x=0;\nconsole.log(x);",
  },

  rc: {
    name: ".esprintrc",
    content: esprintrc,
  },

  ignore: {
    name: ".eslintignore",
    content: "__tests__/*",
  },

  eslint: {
    name: ".eslintrc.json",
    content: eslintrc,
  },
};

const folder = path.join("./tests", testName);
const subFolder = path.join("./tests", testName, testFolder);

fs.mkdirSync(folder);
fs.mkdirSync(subFolder);
fs.writeFileSync(path.join(subFolder, testFile), [imports, hooks].join("\n"));

Object.keys(files).forEach((file) => {
  const { name, content } = files[file];
  fs.writeFileSync(path.join(folder, name), content);
});

console.log(`Successfully created ${testName} test sub-folder!`);
console.log(`You can find it under tests/${testName}.`);
