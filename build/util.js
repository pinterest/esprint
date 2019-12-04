"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findFile = exports.isPortTaken = exports.flatten = exports.promisify = void 0;

var _net = _interopRequireDefault(require("net"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const promisify = fn => {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    return new Promise(function (resolve, reject) {
      args.push(function (err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
      fn.apply(this, args);
    });
  };
};

exports.promisify = promisify;

const flatten = array => {
  return array.reduce(function (acc, curr) {
    return curr.concat(acc);
  }, []);
};

exports.flatten = flatten;

const isPortTaken = port => {
  return new Promise((resolve, reject) => {
    const tester = _net.default.createServer().once('error', function (err) {
      if (err.code !== 'EADDRINUSE') return reject(err);
      resolve(true);
    }).once('listening', function () {
      tester.once('close', function () {
        resolve(false);
      }).close();
    }).listen(port);
  });
};
/*
 * Walks up a directory until a file is found.
 * @return path - the path where the fileName is found
 */


exports.isPortTaken = isPortTaken;

const findFile = fileName => {
  for (let curDir = process.cwd(); curDir !== '/'; curDir = _path.default.resolve(curDir, '..')) {
    const filepath = _path.default.join(curDir, fileName);

    if (_fs.default.existsSync(filepath)) {
      return filepath;
    }
  }

  return '';
};

exports.findFile = findFile;