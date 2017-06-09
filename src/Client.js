import dnode from 'dnode';
import { clearLine } from './cliUtils';

export default class Client {
  constructor(port, eslint) {
    this.port = port;
    this.eslint = eslint;
  }

  connect() {
    const self = this;
    const d = dnode.connect(this.port);
    d.on('remote', function(remote) {
      setInterval(() => {
        remote.status('', results => {
          if (!results.message) {
            const formatter = self.eslint.getFormatter();
            console.log(formatter(results));
            d.end();
            process.exit(results && results.length > 0 ? 1 : 0);
          } else {
            clearLine();
            process.stdout.write(results.message);
          }
        });
      }, 1000);
    });
  }
}
