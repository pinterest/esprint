"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = void 0;

var _child_process = require("child_process");

var _util = require("../util");

var _cliUtils = require("../cliUtils");

var _Client = _interopRequireDefault(require("../Client"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const connect = options => {
  const args = [];

  for (const key in options) {
    args.push(`--${key}=${options[key]}`);
  }

  const port = options.port;
  (0, _util.isPortTaken)(port).then(isTaken => {
    // start the server if it isn't running
    const client = new _Client.default(options);

    if (!isTaken) {
      const child = (0, _child_process.fork)(require.resolve('../startServer.js'), args, {
        silent: true
      });
      child.on('message', message => {
        if (message.server) {
          // Wait for the server to start before connecting
          client.connect();
        } else if (message.message) {
          (0, _cliUtils.clearLine)();
          process.stdout.write(message.message);
        }
      });
    } else {
      client.connect();
    }
  });
};

exports.connect = connect;