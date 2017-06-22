const execSync = require('child_process').execSync;

function getPid() {
  try {
    const PID = execSync('lsof -i TCP:5004 | grep LISTEN | awk \'{print $2}\'').toString().trim();
    if (PID) {
      return PID;
    }
  } catch (e) {}
}

module.exports = getPid;