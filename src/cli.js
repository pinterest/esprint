#!/usr/bin/env node

import yargs from 'yargs';
import Client from './Client.js';
import fs from 'fs';
import { fork } from 'child_process';
import { isPortTaken, findFile, formatParams } from './util';

const DEFAULT_PORT_NUMBER = 5004;
const DEFAULT_NUM_WORKERS = 4;

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

  const filePath = findFile('.esprintrc');

  if (!filePath) {
    console.error('Unable to find `.esprintrc` file. Exiting...');
    process.exit(0);
  } else {
     Object.assign(options, {rcPath: filePath});
  }

  connect(options);
};

const connect = (options) => {
  const {
    port,
    workers,
    rcPath,
  } = options;

  isPortTaken(port).then(isTaken => {
    // start the server if it isn't running
    const client = new Client(port);

    if (!isTaken) {
      const child = fork(
        require.resolve('./startServer.js'), [`--port=${port}`, `--workers=${workers}`, `--rcPath=${rcPath}`], {/* silent: true */}
      );

      child.on('message', message => {
        if (message.server) {
          // Wait for the server to start before connecting
          client.connect();
        } else if (message.gathering) {
          process.stdout.write(message.gathering);
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
