var glob = require('glob');
var CLIEngine = require('eslint').CLIEngine;

var promisify = require('./util').promisify;
var flatten = require('./util').flatten;
var runLint = require('./LintRunner').run;

var globPromise = promisify(glob);

function run(argv) {
  var paths = argv._;

  var eslintConfig = {
    cache: !!argv.cache,
    fix: !!argv.fix,
    cwd: process.cwd()
  };

  var eslint = new CLIEngine(eslintConfig);

  var globPatterns = eslint.resolveFileGlobPatterns(paths);

  function filterIgnored(files) {
    return files.filter(function(file) {
      return !eslint.isPathIgnored(file);
    });
  }

  // glob match an array of globs
  Promise.all(globPatterns.map(function(glob) {
    return globPromise(glob);
  })).then(function(files) {
    runLint(eslintConfig, filterIgnored(flatten(files))).then(function(results) {
      if (results) {
        prettyPrintResults(results);
        if (hasErrors(results)) {
          process.exit(1);
        }
      }
    });
  }).catch(function(e) {
    console.error(e.stack);
    process.exit(1);
  });

  function prettyPrintResults(results) {
    var formatter = eslint.getFormatter();
    console.log(formatter(results));
  }
}

function hasErrors(results) {
  var errorFiles = results.filter(function(result) {
    return result.errorCount > 0;
  });
  return errorFiles.length !== 0;
}

module.exports = {
  run: run
};
