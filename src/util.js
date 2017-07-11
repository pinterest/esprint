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
};

export const flatten = (array) => {
  return array.reduce(
    function(acc, curr) {
      return curr.concat(acc);
    },
    []
  );
};

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
};

export const getRandomPort = () => {
  let port;
  const server = net.createServer()
    .listen(0, () => port = server.address().port)
    .close();
  
  return port;
}

/*
 * Walks up a directory until a file is found.
 * @return path - the path where the fileName is found
 */
export const findFile = (fileName) => {
  for (let curDir = process.cwd(); curDir !== '/'; curDir = path.resolve(curDir, '..')) {
    const filepath = path.join(curDir, fileName);
    if (fs.existsSync(filepath)) {
      return filepath;
    }
  }
  return '';
};
