import dnode from 'dnode';
import path from 'path';
import WatchmanClient from './WatchmanClient';
import { run as runLint } from './LintRunner';
const CLIEngine = require('eslint').CLIEngine;

const ROOT_DIR = process.cwd();
const cache = {};
let filesToProcess = 0;

const eslint = new CLIEngine({ cwd: ROOT_DIR });

function getResultsFromCache() {
  const results = [];
  Object.keys(cache).forEach(filepath => {
    if (
      cache[filepath] &&
      (cache[filepath].errorCount > 0 || cache[filepath].warningCount > 0)
    ) {
      results.push(cache[filepath]);
    }
  });
  return results;
}

export default class Server {
  constructor(port, numWorkers, pathsToLint) {
    this.port = port;
    this.numWorkers = numWorkers;
    this.pathsToLint = pathsToLint;

    this._setupWatcher(WatchmanClient);

    const server = dnode({
      status: (param, cb) => {
        if (filesToProcess === 0) {
          return cb(getResultsFromCache());
        }

        process.send({filesToProcess: filesToProcess});
      }
    });

    server.listen(this.port);
  }

  _setupWatcher(Client) {
    const client = new Client();
    client.watch({
      dir: ROOT_DIR,
      onChange: changedFile => {
        if (eslint.isPathIgnored(path.join(ROOT_DIR, changedFile.name))) {
          return;
        }
        filesToProcess++;
        runLint({ cwd: ROOT_DIR }, [changedFile.name])
          .then(function(results) {
            const result = results[0];
            if (result) {
              delete result.source;
              cache[result.filePath] = result;
            }
            filesToProcess--;
          })
          .catch(e => console.error(e));
      }
    });
  }
}
