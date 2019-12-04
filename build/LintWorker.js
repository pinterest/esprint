"use strict";

var _eslint = require("eslint");

const lintFile = (fileArg, fix) => {
  if (!Array.isArray(fileArg)) {
    fileArg = [fileArg];
  }

  const eslint = new _eslint.CLIEngine({
    cwd: process.cwd(),
    fix
  });
  const report = eslint.executeOnFiles(fileArg);

  _eslint.CLIEngine.outputFixes(report);

  return report.results;
};

module.exports = (options, callback) => {
  const results = lintFile(options.fileArg, options.fix);

  if (options.suppressWarnings) {
    callback(null, _eslint.CLIEngine.getErrorResults(results));
  } else {
    callback(null, results);
  }
};