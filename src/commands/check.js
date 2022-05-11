import glob from "glob";
import path from "path";
import { ESLint } from "eslint";
import LintRunner from "../LintRunner";

export const check = async (options) => {
  const {
    workers,
    paths,
    formatter,
    ignored,
    rcPath,
    maxWarnings,
    quiet,
    fix,
  } = options;

  const lintRunner = new LintRunner(workers, !!quiet, fix);
  const rcDir = path.dirname(rcPath);
  const eslint = new ESLint({ cwd: rcDir });

  const filePaths = (
    paths.map((globPath) =>
      glob.sync(globPath, { cwd: rcDir, absolute: true, ignore: ignored, nodir: true })
    ) || []
  ).flat();
  // filter out the files that we tell eslint to ignore
  const nonIgnoredFilePaths = (
    await Promise.all(
      filePaths.map(async (filePath) => {
        return (await eslint.isPathIgnored(filePath)) ||
          filePath.indexOf("eslint") !== -1
          ? null
          : filePath;
      })
    )
  ).filter(Boolean);

  const results = await lintRunner.run(nonIgnoredFilePaths);
  const records = results.records.filter((record) => {
    return record.warningCount > 0 || record.errorCount > 0;
  });

  const lintFormatter = await eslint.loadFormatter(formatter);
  console.log(lintFormatter.format(records));
  process.exit(
    results &&
      (results.errorCount > 0
        ? 1
        : 0 || results.warningCount > maxWarnings
        ? 1
        : 0)
  );
};
