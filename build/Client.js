"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dnode = _interopRequireDefault(require("dnode"));

var _eslint = require("eslint");

var _cliUtils = require("./cliUtils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Client {
  constructor(options) {
    const {
      port,
      formatter,
      maxWarnings
    } = options;
    const eslint = new _eslint.CLIEngine();
    this.port = port;
    this.formatter = eslint.getFormatter(formatter);
    this.maxWarnings = maxWarnings;
  }

  connect() {
    const d = _dnode.default.connect(this.port);

    const formatter = this.formatter;
    const maxWarnings = this.maxWarnings;
    d.on('remote', function (remote) {
      setInterval(() => {
        remote.status('', results => {
          if (!results.message) {
            d.end();
            console.log(formatter(results.records));
            process.exit(results && (results.errorCount > 0 ? 1 : 0 || results.warningCount > maxWarnings ? 1 : 0));
          } else {
            (0, _cliUtils.clearLine)();
            process.stdout.write(results.message);
          }
        });
      }, 1000);
    });
  }

}

exports.default = Client;