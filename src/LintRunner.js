var workerFarm = require('worker-farm');
var workers = workerFarm(
  {
    autoStart: true,
    maxConcurrentCallsPerWorker: Infinity
  },
  require.resolve('./LintWorker')
);
var promisify = require('./util').promisify;
var flatten = require('./util').flatten;
var hash = require('./util').hash;

var workersPromise = promisify(workers);

function run(config, files) {
  // distribute files to workers by hash
  // files.forEach(function(file) {
  //   workerToFile[hash(file)].push(file);
  // });
  return Promise.all(
    files.map((file, index) => {
      return workersPromise({
        config: config,
        hash: 'foo',
        fileArg: file
      });
    })
  )
    .then(function(results) {
      // workerFarm.end(workers);
      return flatten(results);
    })
    .catch(function(e) {
      console.error(e.stack);
      process.exit(1);
    });
}

module.exports = {
  run: run
};
