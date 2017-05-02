import dnode from 'dnode';
import path from 'path';
import sane from 'sane';
import glob from 'glob';
import fs from 'fs';
import { run as runLint } from './LintRunner';
const CLIEngine = require('eslint').CLIEngine;

const ROOT_DIR = process.cwd();
let cache = {};
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
  if (eslint.isPathIgnored(path.join(ROOT_DIR, file)) || file.indexOf('eslint') !== -1) {
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
    process.send({ file: file });
  });
}

// Returns the current folder that a file is in
const getDirectory = (filePath) => {
  let dir = filePath.split("/")
  dir.pop();
  dir = dir.join("/");
  return dir;
}

export default class Server {
  constructor(options) {
    const {
      workers,
      port,
      rcPath,
    } = options;

    this.port = port;
    this.numWorkers = workers;
    this.rcPath = rcPath;

    this._setupEsprintrc(this.rcPath);

    const rootDir = getDirectory(this.rcPath);

    this._setupWatcher(rootDir, this.paths, this.ignored);

    const server = dnode({
      status: (param, cb) => {
        if (filesToProcess === 0) {
          return cb(getResultsFromCache());
        } else {
          return cb({message: "Linting...", files: filesToProcess})
        }
      }
    });

    process.send({server: server})

    server.listen(this.port);
  }

  _setupWatcher(root, paths, ignored) {
    const watcher = sane(root, {
      glob: paths,
      ignored: ignored,
      dot: true,
      watchman: true,
    });

    watcher.on('ready', () => {
      watcher.globs.forEach((jsGlob, idx) => {
        glob(jsGlob, {}, (err, files) => {
          lintAllFiles(files);
        });
      });
    });
    watcher.on('change', (filepath, root, stat) => {
      // TODO(allenk): Check for .eslintrc changes, invalidate the cache, and lint all files again
      process.send({filePath: filepath});
      if (filepath.indexOf('.eslintrc') !== -1) {
        watcher.globs.forEach((jsGlob, idx) => {
          glob(jsGlob, {}, (err, files) => {
            cache = {};
            lintAllFiles(files);
          })
        })
      }
      // } else {
      // lintFile(filepath);
      // }
    });
    watcher.on('add', (filepath, root, stat) => {
      lintFile(filepath);
    });
  }

  _setupEsprintrc() {
    const rc = JSON.parse(fs.readFileSync(this.rcPath));
    this.paths = rc.paths;
    this.ignored = rc.ignored;
  }
}
