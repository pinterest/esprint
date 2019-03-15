import dnode from 'dnode';
import path from 'path';
import sane from 'sane';
import glob from 'glob';
import LintRunner from './LintRunner';
import { CLIEngine } from 'eslint';

const ROOT_DIR = process.cwd();

const eslint = new CLIEngine({ cwd: ROOT_DIR });

export default class Server {
  constructor(options) {
    const {
      workers,
      port,
      paths,
      ignored,
      rcPath,
      quiet,
      fix
    } = options;

    this.port = port;
    this.rcPath = rcPath;

    this.cache = {};
    this.filesToProcess = 0;
    this.lintRunner = new LintRunner(workers, !!quiet, fix);

    const rootDir = path.dirname(this.rcPath);

    this._setupWatcher(rootDir, paths.split(','), ignored.split(','));

    const server = dnode({
      status: (param, cb) => {
        if (this.filesToProcess === 0) {
          return cb(this.getResultsFromCache());
        } else {
          return cb({message: `Linting...${this.filesToProcess} left to lint`});
        }
      }
    });

    process.send({server: server});

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
      process.send({message: 'Reading files to be linted...[this may take a little bit]'});
      let filePaths = [];
      for (let i = 0; i < paths.length; i++) {
        const files = glob.sync(paths[i], {
          cwd: root,
          absolute: true,
        });
        files.forEach((file) => {
          filePaths.push(file);
        });
      }

      this.lintAllFiles(filePaths);
    });

    watcher.on('change', (filepath) => {
      let filePaths = [];
      if (filepath.indexOf('.eslintrc') !== -1) {
        this.cache = {};
        for (let i = 0; i < paths.length; i++) {
          const files = glob.sync(paths[i], {
            cwd: root,
            absolute: true,
          });
          files.forEach((file) => {
            filePaths.push(file);
          });
        }
        this.lintAllFiles(filePaths);
      } else {
        this.lintFile(filepath);
      }
    });
    watcher.on('add', (filepath) => {
      this.lintFile(filepath);
    });
    watcher.on('delete', (filepath) => {
      delete this.cache[filepath];
    });
  }

  getResultsFromCache() {
    const records = Object.keys(this.cache).filter(filepath => {
      return this.cache[filepath] &&
        (this.cache[filepath].errorCount > 0 || this.cache[filepath].warningCount > 0);
    }).map(filepath => this.cache[filepath]);

    const { errorCount, warningCount } = records.reduce((a, b) => ({
      errorCount: a.errorCount + b.errorCount,
      warningCount: a.warningCount + b.warningCount,
    }), { errorCount: 0, warningCount: 0 });

    return {
      records,
      errorCount,
      warningCount,
    };
  }

  lintFile(file) {
    if (eslint.isPathIgnored(file) || file.indexOf('eslint') !== -1) {
      return;
    }
    this.filesToProcess++;
    const that = this;
    this.lintRunner.run([file])
      .then(function(results) {
        const record = results.records[0];
        if (record) {
          delete record.source;
          that.cache[record.filePath] = record;
        }
        that.filesToProcess--;
      })
      .catch(e => console.error(e));
  }

  lintAllFiles(files) {
    files.map((file) => {
      this.lintFile(file);
    });
  }
}
