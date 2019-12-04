"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.stop = void 0;

var _fs = require("fs");

var _child_process = require("child_process");

var _util = require("../util.js");

const stop = () => {
  const filePath = (0, _util.findFile)('.esprintrc');
  const rc = JSON.parse((0, _fs.readFileSync)(filePath));

  if (rc.port) {
    const {
      port
    } = rc;
    const command = `lsof -i TCP:${port} | grep LISTEN | awk '{print $2}' | xargs kill -9`;
    (0, _child_process.execSync)(command);
    console.log(`Server running on port ${port} found and stopped`);
  } else {
    console.warn('No port specified in `.esprintrc` file');
  }
};

exports.stop = stop;