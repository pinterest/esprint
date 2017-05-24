#!/usr/bin/env node

const execSync = require('child_process').execSync;
const readFileSync = require('fs').readFileSync;
const path = require('path');

const dirPath = process.argv[2];
const packageJson = JSON.parse(readFileSync(path.join(dirPath, 'package.json')));

if (!packageJson) {
  console.log('No package.json found at the path specified. Exiting...');
  process.exit(0);
}

const install = 'npm i ';
const link = 'npm ln '
let dependencies = '';

const devDeps = packageJson['devDependencies'];

for (const key in devDeps) {
  if (key.indexOf('eslint') !== -1) {
    // Manually link file: dependencies
    if (devDeps[key].startsWith('file:')) {
      execSync(`${link} ${path.join(dirPath, devDeps[key])}`);
    } else {
      dependencies += `${key}@${devDeps[key]} `;
    }
  }
}

execSync(`${install} ${dependencies}`);
