"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.check = void 0;

var _glob = _interopRequireDefault(require("glob"));

var _path = _interopRequireDefault(require("path"));

var _eslint = require("eslint");

var _LintRunner = _interopRequireDefault(require("../LintRunner"));

var _util = require("../util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const check = options => {
  const {
    workers,
    paths,
    formatter,
    rcPath,
    maxWarnings,
    quiet,
    fix
  } = options;
  const lintRunner = new _LintRunner.default(workers, !!quiet, fix);

  const rcDir = _path.default.dirname(rcPath);

  const eslint = new _eslint.CLIEngine({
    cwd: rcDir
  });
  const filePaths = (0, _util.flatten)(paths.map(globPath => _glob.default.sync(globPath, {
    cwd: rcDir,
    absolute: true
  }))); // filter out the files that we tell eslint to ignore

  const nonIgnoredFilePaths = filePaths.filter(filePath => {
    return !(eslint.isPathIgnored(filePath) || filePath.indexOf('eslint') !== -1);
  });
  lintRunner.run(nonIgnoredFilePaths).then(results => {
    const records = results.records.filter(record => {
      return record.warningCount > 0 || record.errorCount > 0;
    });
    const lintFormatter = eslint.getFormatter(formatter);
    console.log(lintFormatter(records));
    process.exit(results && (results.errorCount > 0 ? 1 : 0 || results.warningCount > maxWarnings ? 1 : 0));
  });
};

exports.check = check;