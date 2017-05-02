import dnode from 'dnode';

const CLIEngine = require('eslint').CLIEngine;

const eslint = new CLIEngine();

function prettyPrintResults(results) {
  const formatter = eslint.getFormatter();
  console.log(formatter(results));
}

const objEqual = (obj1, obj2) => {

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
          if (!results.message) {
            prettyPrintResults(results);
          } else {
            console.log(results.message, results.files);
          }
        });
      }, 1000);
    });
  }
}
