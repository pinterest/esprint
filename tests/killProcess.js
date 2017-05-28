const execSync = require('child_process').execSync;

function killProcess() {
  try {
    execSync(`lsof -i TCP:5004 | grep LISTEN | awk '{print $2}' | xargs kill -9`);
  } catch (e) {}
}

module.exports = killProcess;