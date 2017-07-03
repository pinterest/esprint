import glob from 'glob';
import path from 'path';
import { CLIEngine } from 'eslint';
import LintRunner from '../LintRunner';
import { flatten } from '../util';

export const check = (options) => {
  const {
    workers,
    paths,
    json,
    rcPath,
  } = options;

  const lintRunner = new LintRunner(workers);
  const rcDir = path.dirname(rcPath);
  const eslint = new CLIEngine({ cwd: rcDir });

  const filePaths = flatten(paths.map(globPath => glob.sync(globPath, { cwd: rcDir })));
  // filter out the files that we tell eslint to ignore
  const nonIgnoredFilePaths = filePaths.filter((filePath) => {
    return !(eslint.isPathIgnored(path.join(rcDir, filePath)) || filePath.indexOf('eslint') !== -1);
  });

  lintRunner.run({ cwd: rcDir }, nonIgnoredFilePaths)
    .then((results) => {
      const records = results.records.filter((record) => {
        return record.warningCount > 0 || record.errorCount > 0;
      });

      const formatter = json ? eslint.getFormatter("json") : eslint.getFormatter();
      console.log(formatter(records));
      process.exit(results && results.errorCount > 0 ? 1 : 0);
    });
};
