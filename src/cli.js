#!/usr/bin/env node

import yargs from 'yargs';
import { fork } from 'child_process';
import { isPortTaken } from './util';

isPortTaken(5004).then(isTaken => {
  // start the server if it isn't running
  if (!isTaken) {
    fork(
      require.resolve('./startServer.js'),
      {
        // silent: true
      }
    );
  }

  // wait for the server to be ready
  require('./Client.js');
});
