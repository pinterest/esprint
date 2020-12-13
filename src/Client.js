import jayson from 'jayson';
import { CLIEngine } from 'eslint';
import { clearLine } from './cliUtils';

export default class Client {
  constructor(options) {
    const { port, formatter, maxWarnings } = options;
    const eslint = new CLIEngine();
    this.port = port;
    this.formatter = eslint.getFormatter(formatter);
    this.maxWarnings = maxWarnings;
  }

  connect() {
    const client = jayson.client.http({
      port: this.port
    });

    const formatter = this.formatter;
    const maxWarnings = this.maxWarnings;

    setInterval(() => {
      client.request('status', null, function(error, response) {
        if (error) {
          throw error;
        }
        const { result } = response;
        if (!result.message) {
          console.log(formatter(result.records));
          process.exit(result && (result.errorCount > 0 ? 1 : 0
              || result.warningCount > maxWarnings ? 1 : 0));
        } else {
          clearLine();
          process.stdout.write(result.message);
        }
      });

    }, 1000);
  }
}
