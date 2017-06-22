import { CLIEngine } from 'eslint';

const lintFile = (config, hash, fileArg) => {
  if (!Array.isArray(fileArg)) {
    fileArg = [fileArg];
  }

  // Store in a filename-based cache file
  config = Object.assign({}, config, {
    cacheLocation: './.eslintcachedir/esprint.cache.' + hash
  });

  const eslint = new CLIEngine(config);
  const report = eslint.executeOnFiles(fileArg);

  // autofix if possible (experimental)
  if (config.fix) {
    CLIEngine.outputFixes(report);
  }
  return report.results;
};

module.exports = (options, callback) => {
  const results = lintFile(options.config, options.hash, options.fileArg);
  callback(null, results);
};
