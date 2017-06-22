const execSync = require('child_process').execSync;
const getPid = require('./getPid.js');

function killProcess() {
  try {
    const PID = getPid();
    if (PID) {
      execSync(`kill -9 ${PID}`);
    }
  } catch (e) {}
}

module.exports = killProcess;