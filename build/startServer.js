"use strict";

var _Server = _interopRequireDefault(require("./Server"));

var _yargs = _interopRequireDefault(require("yargs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

new _Server.default(_yargs.default.argv);