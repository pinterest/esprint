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
            d.end();
            prettyPrintResults(results.records);
            process.exit(results && results.errorCount > 0 ? 1 : 0);
          } else {
            clearLine();
            process.stdout.write(results.message);
          }
        });
      }, 1000);
    });
  }
}
