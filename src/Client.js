import dnode from 'dnode';
const CLIEngine = require('eslint').CLIEngine;

const ROOT_DIR = '/Users/arthur/code/pinboard/webapp';
const eslint = new CLIEngine({ cwd: ROOT_DIR });

function prettyPrintResults(results) {
  var formatter = eslint.getFormatter();
  console.log(formatter(results));
}

var d = dnode.connect(5004);
d.on('remote', function(remote) {
  remote.status('', results => {
    prettyPrintResults(results);
    d.end();
  });
});
