#!/usr/bin/env node

import yargs from 'yargs';
import Client from './Client.js';
import { fork } from 'child_process';
import { isPortTaken, promisify } from './util';

const DEFAULT_PORT_NUMBER = 5004;
// TODO(allenk): See if this does anything
const DEFAULT_NUM_WORKERS = 4;

// TODO(allenk): This is less than ideal right now since we take in args from the main process
// Just to pass them back through the server and client

const start = () => {
  const usage = `Spins up a server on a specified port to run eslint in parallel.
    Usage: esprint [args]`;

  let options = yargs
    .usage(usage)
    .describe('port', 'The port for the server and client to connect to.')
    .option('port', {
      alias: 'p',
      default: DEFAULT_PORT_NUMBER,
    })
    .describe('workers', 'The number of parallel workers to run')
    .option('workers', {
      alias: 'w',
      default: DEFAULT_NUM_WORKERS
    })
    .help().argv

  const pathsToWatch = options._;

  Object.assign(options, {paths: pathsToWatch});

  connect(options);
};

const connect = (options) => {
  const {
    port,
    paths,
    workers,
  } = options;

  isPortTaken(port).then(isTaken => {
    // start the server if it isn't running
    const client = new Client(port);
    if (!isTaken) {
      const child = fork(
        require.resolve('./startServer.js'), [port, workers, paths], {/* silent: true */}
      );

      child.on('message', message => {
        console.log(message);
        if (message.server) {
          // Wait for the server to start before connecting
          client.connect();
        }
      });
    } else {
      // Connect anyways
      // TODO(allenk): Actually check that the server is occupying the port
      client.connect();
    }
  });
};

start();
