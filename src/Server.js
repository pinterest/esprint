import glob from "glob";
import jayson from "jayson";
import path from "path";
import sane from "sane";
import LintRunner from "./LintRunner";
import { ESLint } from "eslint";

const ROOT_DIR = process.cwd();

const eslint = new ESLint({ cwd: ROOT_DIR });

export default class Server {
  constructor(options) {
    const { workers, port, paths, ignored, rcPath, quiet, fix, noWatchman } =
      options;

    this.port = port;
    this.rcPath = rcPath;

    this.cache = {};
    this.filesToProcess = 0;
    this.initializing = true;
    this.lintRunner = new LintRunner(workers, !!quiet, fix === "true");
    this.noWatchman = noWatchman;

    const rootDir = path.dirname(this.rcPath);

    this._setupWatcher(rootDir, paths.split(","), ignored.split(","));

    const that = this;

    const server = jayson.server({
      status: function (args, cb) {
        if (that.initializing) {
          cb(null, {
            message: `Initializing`,
          });
        } else if (that.filesToProcess === 0) {
          cb(null, that.getResultsFromCache());
        } else {
          const { errorCount, warningCount } = that.getResultsFromCache();
          cb(null, {
            message: `Linting...${that.filesToProcess} left to lint. Errors: ${errorCount} / Warnings: ${warningCount}`,
          });
        }
      },
    });

    process.send({ server: server });

    server.http().listen(this.port);
  }

  _setupWatcher(root, paths, ignored) {
    const watcher = sane(root, {
      glob: paths,
      ignored: ignored,
      dot: true,
      watchman: this.noWatchman ? false : true,
    });

    watcher.on("ready", async () => {
      this.initializing = false;
      process.send({
        message: "Reading files to be linted...[this may take a little bit]",
      });
      let filePaths = [];
      for (let i = 0; i < paths.length; i++) {
        const files = glob.sync(paths[i], {
          cwd: root,
          absolute: true,
          ignore: ignored,
          nodir: true,
        });
        files.forEach((file) => {
          filePaths.push(file);
        });
      }

      await this.lintAllFiles(filePaths);
    });

    watcher.on("change", async (filepath) => {
      let filePaths = [];
      if (filepath.indexOf(".eslintrc") !== -1) {
        this.cache = {};
        for (let i = 0; i < paths.length; i++) {
          const files = glob.sync(paths[i], {
            cwd: root,
            absolute: true,
            ignore: ignored,
            nodir: true,
          });
          files.forEach((file) => {
            filePaths.push(file);
          });
        }
        await this.lintAllFiles(filePaths);
      } else {
        await this.lintFile(filepath);
      }
    });
    watcher.on("add", async (filepath) => {
      await this.lintFile(filepath);
    });
    watcher.on("delete", (filepath) => {
      delete this.cache[filepath];
    });
  }

  getResultsFromCache() {
    const records = Object.keys(this.cache)
      .filter((filepath) => {
        return (
          this.cache[filepath] &&
          (this.cache[filepath].errorCount > 0 ||
            this.cache[filepath].warningCount > 0)
        );
      })
      .map((filepath) => this.cache[filepath]);

    const { errorCount, warningCount } = records.reduce(
      (a, b) => ({
        errorCount: a.errorCount + b.errorCount,
        warningCount: a.warningCount + b.warningCount,
      }),
      { errorCount: 0, warningCount: 0 }
    );

    return {
      records,
      errorCount,
      warningCount,
    };
  }

  async lintFile(file) {
    if ((await eslint.isPathIgnored(file)) || file.indexOf("eslint") !== -1) {
      return;
    }
    this.filesToProcess++;
    const that = this;
    try {
      const results = await this.lintRunner.run([file]);
      const record = results.records[0];
      if (record) {
        delete record.source;
        that.cache[record.filePath] = record;
      }
      that.filesToProcess--;
    } catch (e) {
      console.error(e);
    }
  }

  async lintAllFiles(files) {
    await Promise.all(
      files.map(async (file) => {
        await this.lintFile(file);
      })
    );
  }
}
