import net from 'net';
import fs from 'fs';
import path from 'path';

export const promisify = (fn) => {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    return new Promise(function(resolve, reject) {
      args.push(function(err, res) {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });

      fn.apply(this, args);
    });
  };
}

export const flatten = (array) => {
  return array.reduce(
    function(acc, curr) {
      return curr.concat(acc);
    },
    []
  );
}

export const isPortTaken = (port) => {
  return new Promise((resolve, reject) => {
    const tester = net
      .createServer()
      .once('error', function(err) {
        if (err.code !== 'EADDRINUSE') return reject(err);
        resolve(true);
      })
      .once('listening', function() {
        tester
          .once('close', function() {
            resolve(false);
          })
          .close();
      })
      .listen(port);
  });
}

/*
 * Walks up a directory until a file is found.
 * @return path - the path where the fileName is found
 */
export const findFile = (fileName) => {
  let cwd = process.cwd();
  let curDir = cwd;
  let exists = fs.existsSync(path.join(process.cwd(), fileName));
  while (!exists && cwd !== '/') {
    curDir = process.chdir('..');
    exists = fs.existsSync(path.join(process.cwd(), fileName));
  }
  let filePath = exists ? path.join(process.cwd(), fileName) : '';
  process.chdir(cwd);
  return filePath;
};
