#!/usr/bin/env node

import yargs from 'yargs';
import Client from './Client.js';
import fs from 'fs';
import os from 'os';
import { stop, check } from './commands/';
import { fork } from 'child_process';
import { isPortTaken, findFile } from './util';
import { clearLine } from './cliUtils';

const DEFAULT_PORT_NUMBER = 5004;
const DEFAULT_NUM_WORKERS = 4;

const getEsprintOptions = () => {
  const options = {};
  const filePath = findFile('.esprintrc');

  if (!filePath) {
    console.error('Unable to find `.esprintrc` file. Exiting...');
    process.exit(1);
  } else {
    const rc = JSON.parse(fs.readFileSync(filePath));

    const numCpus = os.cpus().length;
    if (!rc.workers) {
      Object.assign(options, {workers: DEFAULT_NUM_WORKERS});
    } else if (rc.workers && rc.workers > numCpus) {
      rc.workers = numCpus;
    }

    Object.assign(options, rc);
    Object.assign(options, {rcPath: filePath});

    return options;
  }
}

const start = () => {
  const options = {};
  const usage = `Spins up a server on a specified port to run eslint in parallel.
    Usage: esprint [args]`;

  const argv = yargs
    .usage(usage)
    .command('stop', 'Stops running the background server', () => {}, () => {
      stop();
    })
    .command('check', 'Runs eslint in parallel with no background server', () => {}, () => {
      const options = getEsprintOptions();
      check(options);
    })
    .command(['*', 'start'], 'Starts up a background server which listens for file changes.', () => {}, (argv) => {
      const options = getEsprintOptions();
      if (!options.port) {
        process.exit(1);
      } else {
        if (argv.json) {
          Object.assign(options, {json: argv.json});
          run(options);
        } else {
          connect(options);
        }
      }
    })
    .help().argv;
};

const connect = (options) => {
  const args = [];
  for (const key in options) {
    args.push(`--${key}=${options[key]}`);
  }

  const port = options.port;

  isPortTaken(port).then(isTaken => {
    // start the server if it isn't running
    const client = new Client(port);

    if (!isTaken) {
      const child = fork(
        require.resolve('./startServer.js'), args, { silent: true }
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

start();
