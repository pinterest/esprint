import dnode from 'dnode';
const CLIEngine = require('eslint').CLIEngine;

const eslint = new CLIEngine();

function prettyPrintResults(results) {
  const formatter = eslint.getFormatter();
  console.log(formatter(results));
}

export default class Client {
  constructor(port) {
    this.port = port;
    this.completedFullRun = false;
  }

  connect() {
    const d = dnode.connect(this.port);
    d.on('remote', function(remote) {
      setInterval(() => {
        remote.status('', results => {
          if (results.length && !this.completedFullRun) {
            this.completedFullRun = true;
            prettyPrintResults(results);
          } else {
            return;
          }
        });
      }, 1000);
    });
  }
}
