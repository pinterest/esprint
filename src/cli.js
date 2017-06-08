#!/usr/bin/env node

import yargs from 'yargs';
import Client from './Client.js';
import fs from 'fs';
import { killPort, run } from './commands/';
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

    if (!rc.workers) {
      Object.assign(options, {workers: DEFAULT_NUM_WORKERS});
    } else if (rc.workers && rc.workers > require('os').cpus().length) {
      conosle.error(`Cannot use the amount of worker threads specified! Maximum: ${require('os').cpus().length}. Specified: ${rc.workers}. Exiting...`);
      process.exit(0);
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
    .command('kill', 'Kills the background server', () => {}, () => {
      killPort();
    })
    .command('run', 'Runs eslint in parallel with no background server', () => {}, () => {
      const options = getEsprintOptions();
      run(options);
    })
    .command(['*', 'start'], 'Starts up a background server which listens for file changes. If no port is specified, then runs parallelized eslint with no background server', () => {}, (argv) => {
      const options = getEsprintOptions();
      if (!options.port) {
        run(options);
      } else {
        connect(options);
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
