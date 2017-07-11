import dnode from 'dnode';
import { CLIEngine } from 'eslint';
import { clearLine } from './cliUtils';

export default class Client {
  constructor(options) {
    const { port, formatter } = options;
    const eslint = new CLIEngine();
    this.port = port;
    this.formatter = eslint.getFormatter(formatter);
  }

  connect() {
    const d = dnode.connect(this.port);
    const formatter = this.formatter;
    d.on('remote', function(remote) {
      setInterval(() => {
        remote.status('', results => {
          if (!results.message) {
            d.end();
            console.log(formatter(results.records));
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
