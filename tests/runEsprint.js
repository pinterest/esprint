const execSync = require('child_process').execSync;
const path = require('path');

const esprintPath = path.join(__dirname, '../build/cli.js');

function runEsprint(cwd, args) {
  try {
    const stdout = execSync(`node ${esprintPath} ${args || ''}`, {
      cwd: cwd
    });
    return {
      stdout: stdout
    };
  } catch(e) {
    return {
      error: e
    };
  }
}

module.exports = runEsprint;
