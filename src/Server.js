import dependencyTree from 'dependency-tree';
import glob from 'glob';
import jayson from 'jayson';
import micromatch from 'micromatch';
import path from 'path';
import sane from 'sane';
import LintRunner from './LintRunner';
import { CLIEngine } from 'eslint';

const ROOT_DIR = process.cwd();

const eslint = new CLIEngine({ cwd: ROOT_DIR });

const GLOBAL_DEPENDENCIES = Object.freeze([
  'package-lock.json',
  'yarn.lock',
  '.eslintrc',
  '.eslintrc.yml',
  '.eslintrc.yaml',
  '.eslintrc.js',
  '.eslintrc.cjs',
  '.eslintrc.json',
  'package.json'
]);

const delay = (amount) => new Promise(resolve => setTimeout(resolve, amount));

const MAX_ATTEMPTS = 8;

export default class Server {
  constructor(options) {
    const {
      workers,
      port,
      rcPath,
      quiet,
      fix,
    } = options;

    this.port = port;
    this.rcPath = rcPath;

    this.cache = {};
    this.filesToProcess = 0;
    this.lintRunner = new LintRunner(workers, !!quiet, fix);

    const rootDir = path.dirname(this.rcPath);

    this._setupWatcher(rootDir, options);

    const that = this;

    const server = jayson.server({
      status: function(_, cb) {
        if (that.filesToProcess === 0) {
          cb(null, that.getResultsFromCache());
        } else {
          cb(null, {message: `Linting...${that.filesToProcess} left to lint`});
        }
      }
    });

    if(process.send) process.send({server: server});

    server.http().listen(this.port);
  }

  _setupWatcher(root, options) {
    const {
      paths,
      ignored,
      requireConfig,
      webpackConfig,
      tsConfig,
      watchman,
    } = options;
    const ignoredArr = ignored.split(',');
    const pathsArr = paths.split(',');

    const dependentsOf = {};
    const dependenciesOf = {};

    const removeDependencies = (filename) => {
      (dependenciesOf[filename] || []).forEach((path) => {
        const updatedDependents = (dependentsOf[path] || []).filter((path2) => path2 !== filename);
        if (updatedDependents.length > 0) {
          dependentsOf[path] = updatedDependents;
        } else {
          delete dependentsOf[path];
        }
      });
      delete dependenciesOf[filename];
    };

    const updateDependencies = (filename) => {
      removeDependencies(filename);
      dependenciesOf[filename] = dependencyTree.toList({
        filename,
        directory: root,
        requireConfig,
        webpackConfig,
        tsConfig,
        filter: path => !micromatch.some(path, ignoredArr, { dot: true }) && !eslint.isPathIgnored(path) && path.indexOf('eslint') === -1,
      }).concat(GLOBAL_DEPENDENCIES).map((abs) => path.relative(root, abs));
      dependenciesOf[filename].forEach((file) => {
        dependentsOf[file] = [...(dependentsOf[file] || []), filename];
      });
    };

    const updateDependenciesWatcher = () => {
      if (dependenciesWatcher) dependenciesWatcher.close();
      dependenciesWatcher = sane(root, {
        glob: Object.keys(dependentsOf),
        ignored: ignoredArr,
        dot: true,
        watchman: process.env.NODE_ENV !== 'test' && watchman,
      });
      const onChange = (filepath) => {
        if (dependentsOf[filepath] && dependentsOf[filepath].length > 0) {
          dependentsOf[filepath].forEach((path) => {
            updateDependencies(path);
            this.lintFile(path);
          });
          updateDependenciesWatcher();
        }
      };
      dependenciesWatcher.on('change', onChange);
      dependenciesWatcher.on('delete', (filepath) => {
        onChange(filepath);
        delete dependentsOf[filepath];
        updateDependenciesWatcher();
      });
    };

    const globWatcher = sane(root, {
      glob: pathsArr,
      ignored: ignoredArr,
      dot: true,
      watchman: process.env.NODE_ENV !== 'test' && watchman,
    });

    let dependenciesWatcher = null;

    globWatcher.on('ready', () => {
      if(process.send) process.send({message: 'Reading files to be linted...[this may take a little bit]'});
      const allFiles = new Set();
      for (const path of pathsArr) {
        const files = glob.sync(path, {
          cwd: root,
          absolute: true,
          ignore: ignoredArr,
        });
        files.forEach((file) => allFiles.add(file));
      }
      const filePaths = [...allFiles].filter((file) => file && !eslint.isPathIgnored(file) && file.indexOf('eslint') === -1);
      filePaths.forEach(updateDependencies);
      updateDependenciesWatcher();
      this.lintAllFiles(filePaths);
    });
    globWatcher.on('add', (file) => {
      if (!eslint.isPathIgnored(file) && file.indexOf('eslint') === -1) {
        updateDependencies(file);
        this.lintFile(file);
        updateDependenciesWatcher();
      }
    });
    globWatcher.on('delete', (filepath) => {
      delete this.cache[filepath];
      removeDependencies(filepath);
      updateDependenciesWatcher();
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

  async lintFile(file, attempt = 1) {
    if (eslint.isPathIgnored(file) || file.indexOf('eslint') !== -1) {
      return;
    }
    this.filesToProcess++;
    delete this.cache[file];
    try {
      const { records: [record] } = await this.lintRunner.run([file]);
      if (record) {
        delete record.source;
        this.cache[record.filePath] = record;
      }
      this.filesToProcess--;
    } catch (e) {
      console.error(`Failed to run on '${file} on attempt ${attempt} out of ${MAX_ATTEMPTS}`, e);
      if (attempt < MAX_ATTEMPTS) {
        await delay(250 * 2 ** attempt);
        this.fileToProcess--;
        // Return here so that they aren't nested and can't run out the stack space.
        return this.lintFile(file, attempt + 1);
      }
      this.filesToProcess--;
    }
  }

  async lintAllFiles(files) {
    return Promise.all(files.map((file) => {
      this.lintFile(file);
    }));
  }
}
