import { CLIEngine } from 'eslint';

const eslint = new CLIEngine({ cwd: process.cwd() });

const lintFile = (fileArg) => {
  if (!Array.isArray(fileArg)) {
    fileArg = [fileArg];
  }
  const report = eslint.executeOnFiles(fileArg);
  return report.results;
};

module.exports = (options, callback) => {
  const results = lintFile(options.fileArg);
  callback(null, results);
};
