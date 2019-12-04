"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _workerFarm = _interopRequireDefault(require("worker-farm"));

var _util = require("./util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class LintRunner {
  constructor(numThreads, suppressWarnings, fix) {
    const workers = (0, _workerFarm.default)({
      autoStart: true,
      maxConcurrentCallsPerWorker: Infinity,
      maxConcurrentWorkers: numThreads
    }, require.resolve('./LintWorker'));
    this.workers = (0, _util.promisify)(workers);
    this.suppressWarnings = suppressWarnings;
    this.fix = fix;
  }

  run(files) {
    const that = this;
    return Promise.all(files.map(file => {
      return that.workers({
        fileArg: file,
        suppressWarnings: that.suppressWarnings,
        fix: that.fix
      });
    })).then(results => {
      const records = (0, _util.flatten)(results); // produce a sum of total num of errors/warnings

      const {
        errorCount,
        warningCount
      } = records.reduce((a, b) => ({
        errorCount: a.errorCount + b.errorCount,
        warningCount: a.warningCount + b.warningCount
      }), {
        errorCount: 0,
        warningCount: 0
      });
      return {
        records,
        errorCount,
        warningCount
      };
    }).catch(e => {
      console.error(e.stack);
      process.exit(1);
    });
  }

}

exports.default = LintRunner;