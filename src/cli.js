#!/usr/bin/env node

import yargs from 'yargs';
import fs from 'fs';
import os from 'os';
import { stop, check, connect } from './commands/';
import { findFile } from './util';

const NUM_CPUS = os.cpus().length;
const DEFAULT_PORT_NUMBER = 5004;

const getEsprintOptions = (argv) => {
  const options = {
    workers: NUM_CPUS,
    port: DEFAULT_PORT_NUMBER,
  };

  const filePath = findFile('.esprintrc');

  if (!filePath) {
    console.error('Unable to find `.esprintrc` file. Exiting...');
    process.exit(1);
  } else {
    // read config file
    const rc = JSON.parse(fs.readFileSync(filePath));

    Object.assign(options, rc);
    options.rcPath = filePath;
    options.workers = NUM_CPUS;

    // CLI overrides
    if (argv.workers) {
      if (argv.workers > NUM_CPUS) {
        console.warn(`Number of CPUs specified (${argv.workers}) exceeded system max (${NUM_CPUS}). Using ${NUM_CPUS}`);
        argv.workers = NUM_CPUS;
      }
      options.workers = argv.workers;
    }

    // ESLint-specific options
    if (argv.format || argv.f) {
      Object.assign(options, {formatter: argv.f ? argv.f : argv.format});
    }
    if (argv.fix) {
      Object.assign(options, {fix: true});
    }

    // NB: Passing --quiet as a number for compatibility with yargs
    options.quiet = options.quiet || argv.quiet ? 1 : 0;

    return options;
  }
};

const usage = `Spins up a server on a specified port to run eslint in parallel.
  Usage: esprint [args]`;

yargs
  .usage(usage)
  .command('stop', 'Stops running the background server', () => {}, () => {
    stop();
  })
  .command('check', 'Runs eslint in parallel with no background server', () => {}, (argv) => {
    const options = getEsprintOptions(argv);
    check(options);
  })
  .command(['*', 'start'], 'Starts up a background server which listens for file changes.', () => {}, (argv) => {
    const options = getEsprintOptions(argv);
    if (!options.port) {
      process.exit(1);
    } else {
      connect(options);
    }
  })
  .help().argv;
