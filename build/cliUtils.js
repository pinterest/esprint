"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearLine = clearLine;

function clearLine() {
  if (process.stdout.isTTY) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
  }
}