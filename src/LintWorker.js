import { CLIEngine } from 'eslint';

const lintFile = (config, fileArg) => {
  if (!Array.isArray(fileArg)) {
    fileArg = [fileArg];
  }

  const eslint = new CLIEngine(config);
  const report = eslint.executeOnFiles(fileArg);

  // autofix if possible (experimental)
  if (config.fix) {
    CLIEngine.outputFixes(report);
  }
  return report.results;
};

module.exports = (options, callback) => {
  const results = lintFile(options.config, options.fileArg);
  callback(null, results);
};
