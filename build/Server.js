"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _dnode = _interopRequireDefault(require("dnode"));

var _path = _interopRequireDefault(require("path"));

var _sane = _interopRequireDefault(require("sane"));

var _glob = _interopRequireDefault(require("glob"));

var _LintRunner = _interopRequireDefault(require("./LintRunner"));

var _eslint = require("eslint");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ROOT_DIR = process.cwd();
const eslint = new _eslint.CLIEngine({
  cwd: ROOT_DIR
});

class Server {
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
    this.lintRunner = new _LintRunner.default(workers, !!quiet, fix);

    const rootDir = _path.default.dirname(this.rcPath);

    this._setupWatcher(rootDir, paths.split(','), ignored.split(','));

    const server = (0, _dnode.default)({
      status: (param, cb) => {
        if (this.filesToProcess === 0) {
          return cb(this.getResultsFromCache());
        } else {
          return cb({
            message: `Linting...${this.filesToProcess} left to lint`
          });
        }
      }
    });
    process.send({
      server: server
    });
    server.listen(this.port);
  }

  _setupWatcher(root, paths, ignored) {
    const watcher = (0, _sane.default)(root, {
      glob: paths,
      ignored: ignored,
      dot: true,
      watchman: process.env.NODE_ENV !== 'test'
    });
    watcher.on('ready', () => {
      process.send({
        message: 'Reading files to be linted...[this may take a little bit]'
      });
      let filePaths = [];

      for (let i = 0; i < paths.length; i++) {
        const files = _glob.default.sync(paths[i], {
          cwd: root,
          absolute: true
        });

        files.forEach(file => {
          filePaths.push(file);
        });
      }

      this.lintAllFiles(filePaths);
    });
    watcher.on('change', filepath => {
      let filePaths = [];

      if (filepath.indexOf('.eslintrc') !== -1) {
        this.cache = {};

        for (let i = 0; i < paths.length; i++) {
          const files = _glob.default.sync(paths[i], {
            cwd: root,
            absolute: true
          });

          files.forEach(file => {
            filePaths.push(file);
          });
        }

        this.lintAllFiles(filePaths);
      } else {
        this.lintFile(filepath);
      }
    });
    watcher.on('add', filepath => {
      this.lintFile(filepath);
    });
    watcher.on('delete', filepath => {
      delete this.cache[filepath];
    });
  }

  getResultsFromCache() {
    const records = Object.keys(this.cache).filter(filepath => {
      return this.cache[filepath] && (this.cache[filepath].errorCount > 0 || this.cache[filepath].warningCount > 0);
    }).map(filepath => this.cache[filepath]);
    const {
      errorCount,
      warningCount
    } = records.reduce((a, b) => ({
      errorCount: a.errorCount + b.errorCount,
      warningCount: a.warningCount + b.warningCount
    }), {
      errorCount: 0,
      warningCount: 0
    });
    return {
      records,
      errorCount,
      warningCount
    };
  }

  lintFile(file) {
    if (eslint.isPathIgnored(file) || file.indexOf('eslint') !== -1) {
      return;
    }

    this.filesToProcess++;
    const that = this;
    this.lintRunner.run([file]).then(function (results) {
      const record = results.records[0];

      if (record) {
        delete record.source;
        that.cache[record.filePath] = record;
      }

      that.filesToProcess--;
    }).catch(e => console.error(e));
  }

  lintAllFiles(files) {
    files.map(file => {
      this.lintFile(file);
    });
  }

}

exports.default = Server;