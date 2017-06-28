import glob from 'glob';
import path from 'path';
import { CLIEngine } from 'eslint';
import LintRunner from '../LintRunner';
import { flatten } from '../util';

const ROOT_DIR = process.cwd();
const eslint = new CLIEngine({ cwd: ROOT_DIR });

export const check = (options) => {
  const {
    workers,
    paths,
    json
  } = options;

  const lintRunner = new LintRunner(workers);

  const filePaths = flatten(paths.map(globPath => glob.sync(globPath)));
  // filter out the files that we tell eslint to ignore
  const nonIgnoredFilePaths = filePaths.filter((filePath) => {
    return !(eslint.isPathIgnored(path.join(ROOT_DIR, filePath)) || filePath.indexOf('eslint') !== -1);
  });


  lintRunner.run({ cwd: ROOT_DIR }, nonIgnoredFilePaths)
    .then((results) => {
      const records = results.records.filter((record) => {
        return record.warningCount > 0 || record.errorCount > 0;
      });

      if (json) {
        console.log(JSON.stringify(records));
      } else {
        const formatter = eslint.getFormatter();
        console.log(formatter(records));
      }
      process.exit(results && results.errorCount > 0 ? 1 : 0);
    });
};
