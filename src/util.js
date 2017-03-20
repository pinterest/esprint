import net from 'net';

export function promisify(fn) {
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

export function flatten(array) {
  return array.reduce(
    function(acc, curr) {
      return curr.concat(acc);
    },
    []
  );
}

export function isPortTaken(port) {
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
