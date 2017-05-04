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
  }

  connect() {
    const d = dnode.connect(this.port);
    d.on('remote', function(remote) {
      setInterval(() => {
        remote.status('', results => {
          if (!results.message) {
            prettyPrintResults(results);
            d.end();
            process.exit(0)
          } else {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(results.message + " " + results.files + " left to lint");
          }
        });
      }, 1000);
    });
  }
}
