import { fork } from 'child_process';

import { isPortTaken } from '../util';
import { clearLine } from '../cliUtils';
import Client from '../Client';

export const connect = (options, eslint) => {
  const args = [];
  for (const key in options) {
    args.push(`--${key}=${options[key]}`);
  }

  const port = options.port;

  isPortTaken(port).then(isTaken => {
    // start the server if it isn't running
    const client = new Client(port, eslint);

    if (!isTaken) {
      const child = fork(
        require.resolve('../startServer.js'), args, { silent: true }
      );

      child.on('message', message => {
        if (message.server) {
          // Wait for the server to start before connecting
          client.connect();
        } else if (message.message) {
          clearLine();
          process.stdout.write(message.message);
        }
      });
    } else {
      // Connect anyways
      // TODO(allenk): Actually check that the server is occupying the port
      client.connect();
    }
  });
};
