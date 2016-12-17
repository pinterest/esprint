var crypto = require('crypto');
var NUM_WORKERS = require('./settings').NUM_WORKERS;

function hash(data) {
  var hex = crypto.createHash('md5').update(data).digest('hex');
  return parseInt(hex.substring(0, 3), 16) % NUM_WORKERS;
}

function promisify(fn) {
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
  }
};

function flatten(array) {
  return array.reduce(function(acc, curr) {
    return curr.concat(acc);
  }, []);
}

module.exports = {
  promisify: promisify,
  flatten: flatten,
  hash: hash
}
