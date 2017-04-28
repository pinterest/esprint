#!/usr/bin/env node

const execSync = require('child_process').execSync;
const readFileSync = require('fs').readFileSync;
const path = require('path');

const packageJson = JSON.parse(readFileSync(path.join(process.argv[2], 'package.json')));

if (!packageJson) {
  console.log('No package.json found at the path specified. Exiting...');
  process.exit(0);
}

let command = 'npm i ';

const devDeps = packageJson['devDependencies'];

for (const key in devDeps) {
  if (key.indexOf('eslint') !== -1) {
    command += `${key}@` + devDeps[key] + ' ';
  }
}

execSync(command);
