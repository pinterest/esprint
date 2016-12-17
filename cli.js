#!/usr/bin/env node

var yargs = require('yargs');
var esprint = require('./esprint');

'use strict';

var args = {
  check: function check(argv) {
    if (argv.runInBand && argv.hasOwnProperty('maxWorkers')) {
      throw new Error('Both --runInBand and --maxWorkers were specified, but these two ' + 'options do not make sense together. Which is it?');
    }
    return true;
  },
  usage: 'Usage: $0 [eslint options]',
  options: {
    runInBand: {
      alias: 'i',
      description: 'Run eslint serially in the current process rather than ' + 'creating a worker pool of child processes',
      type: 'boolean'
    },
    version: {
      alias: 'v',
      description: 'Print the version and exit',
      type: 'boolean'
    },
    cache: {
      description: 'Cache to disk',
      type: 'boolean'
    }
  }
};

var argv = yargs(process.argv.slice(2))
  .usage(args.usage)
  .help()
  .options(args.options)
  .check(args.check)
  .argv;

if (argv.help) {
  yargs.showHelp();
  process.on('exit', () => process.exit(1));
  return;
}

esprint.run(argv);
