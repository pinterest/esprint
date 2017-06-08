import dnode from 'dnode';
import { CLIEngine } from 'eslint';
import { clearLine } from './cliUtils';

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
            process.exit(results && results.length > 0 ? 1 : 0);
          } else {
            clearLine();
            process.stdout.write(results.message + " " + results.files + " left to lint");
          }
        });
      }, 1000);
    });
  }
}
