import dnode from 'dnode';
import path from 'path';
import sane from 'sane';
import glob from 'glob';
import { run as runLint } from './LintRunner';
const CLIEngine = require('eslint').CLIEngine;

const ROOT_DIR = process.cwd();
const cache = {};
let filesToProcess = 0;

const eslint = new CLIEngine({ cwd: ROOT_DIR });

const getResultsFromCache = () => {
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

const lintFile = (file) => {
  if (eslint.isPathIgnored(path.join(ROOT_DIR, file))) {
    return;
  }
  filesToProcess++;
  runLint({ cwd: ROOT_DIR }, [file])
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

const lintAllFiles = (files) => {
  files.map((file, _) => {
    lintFile(file);
  });
}

export default class Server {
  constructor(port, numWorkers, pathsToLint) {
    this.port = port;
    this.numWorkers = numWorkers;
    this.pathsToLint = pathsToLint;

    this._setupWatcher();

    const server = dnode({
      status: (param, cb) => {
        if (filesToProcess === 0) {
          return cb(getResultsFromCache());
        }

        process.send({filesToProcess: filesToProcess});
      }
    });

    process.send({server: server})

    server.listen(this.port);
  }

  _setupWatcher() {
    // TODO(allenk): Fix the glob to come from a top-level .esprintrc file
    const watcher = sane(process.cwd(), {
      glob: 'app/**/*.js',
      ignored: [/node_modules/],
      dot: true,
      watchman: true,
    });

    watcher.on('ready', () => {
      glob(watcher.globs[0], {}, (err, files) => {
        lintAllFiles(files);
      });
    });
    watcher.on('change', (filepath, root, stat) => {
      //TODO(allenk): Check for .eslintrc changes, invalidate the cache, and lint all files again
      lintFile(filepath);
    });
    watcher.on('add', (filepath, root, stat) => {
      lintFile(filepath);
    });
  }
}
