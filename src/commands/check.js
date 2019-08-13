import glob from 'glob';
import path from 'path';
import { CLIEngine } from 'eslint';
import LintRunner from '../LintRunner';
import { flatten } from '../util';

export const check = (options) => {
  const {
    workers,
    paths,
    formatter,
    rcPath,
    maxWarnings,
    quiet,
    fix
  } = options;

  const lintRunner = new LintRunner(workers, !!quiet, fix);
  const rcDir = path.dirname(rcPath);
  const eslint = new CLIEngine({ cwd: rcDir });

  const filePaths = flatten(paths.map(globPath => glob.sync(globPath, { cwd: rcDir, absolute: true })));
  // filter out the files that we tell eslint to ignore
  const nonIgnoredFilePaths = filePaths.filter((filePath) => {
    return !(eslint.isPathIgnored(filePath) || filePath.indexOf('eslint') !== -1);
  });

  lintRunner.run(nonIgnoredFilePaths)
    .then((results) => {
      const records = results.records.filter((record) => {
        return record.warningCount > 0 || record.errorCount > 0;
      });

      const lintFormatter = eslint.getFormatter(formatter);
      console.log(lintFormatter(records));
      process.exit(results && (results.errorCount > 0 ? 1 : 0
        || results.warningCount > maxWarnings ? 1 : 0));
    });
};
