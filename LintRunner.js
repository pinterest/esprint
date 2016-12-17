var workerFarm = require('worker-farm');
var workers = workerFarm({
  autoStart: true,
  maxConcurrentCallsPerWorker: Infinity
}, require.resolve('./LintWorker'));
var promisify = require('./util').promisify;
var flatten = require('./util').flatten;
var hash = require('./util').hash;
var NUM_WORKERS = require('./settings').NUM_WORKERS;

var workersPromise = promisify(workers);

function run(config, files) {
  var workerToFile = (new Array(NUM_WORKERS)).fill().map(function() { return new Array(); });

  // distribute files to workers by hash
  files.forEach(function(file) {
    workerToFile[hash(file)].push(file);
  });

  return Promise.all(workerToFile.map(function(files, index) {
    return workersPromise({
      config: config,
      hash: index,
      fileArg: files
    });
  })).then(function(results) {
    workerFarm.end(workers);
    return flatten(results);
  }).catch(function(e) {
    console.error(e.stack);
    process.exit(1);
  });
}

module.exports = {
  run: run
};
