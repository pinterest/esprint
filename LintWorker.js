var CLIEngine = require('eslint').CLIEngine;

function lintFile(config, hash, fileArg) {
  if (!Array.isArray(fileArg)) {
    fileArg = [ fileArg ];
  }

  // Store in a filename-based cache file
  config = Object.assign({}, config, {
    cacheLocation: './.eslintcachedir/esprint.cache.' + hash
  });

  var eslint = new CLIEngine(config);
  var report = eslint.executeOnFiles(fileArg);

  // autofix if possible (experimental)
  if (config.fix) {
    CLIEngine.outputFixes(report);
  }

  return report.results;
}

module.exports = function (options, callback) {
  var result = lintFile(options.config, options.hash, options.fileArg);
  callback(null, result);
}
