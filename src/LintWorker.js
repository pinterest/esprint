import { CLIEngine } from 'eslint';

const lintFile = (fileArg, fix) => {
  if (!Array.isArray(fileArg)) {
    fileArg = [fileArg];
  }
  const eslint = new CLIEngine({ cwd: process.cwd(), fix });
  const report = eslint.executeOnFiles(fileArg);
  CLIEngine.outputFixes(report);
  return report.results;
};

module.exports = (options, callback) => {
  const results = lintFile(options.fileArg, options.fix);
  if (options.suppressWarnings) {
    callback(null, CLIEngine.getErrorResults(results));
  } else {
    callback(null, results);
  }
};
