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
          // TODO(allenk): make the results more robust, and invalidate full runs from the server
          if (results.length && !this.completedFullRun) {
            this.completedFullRun = true;
            prettyPrintResults(results);
            d.end();
            process.exit(0);
          } else {
            return;
          }
        });
      }, 1000);
    });
  }
}
