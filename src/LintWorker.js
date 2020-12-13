import { CLIEngine } from 'eslint';

const lintFile = (fileArg, fix) => {
  if (!Array.isArray(fileArg)) {
    fileArg = [fileArg];
  }
  const eslint = new CLIEngine({ cwd: process.cwd(), fix });
  const report = eslint.executeOnFiles(fileArg);
  CLIEngine.outputFixes(report);
  return report.results;
};

export async function worker({
  fileArg,
  fix,
  suppressWarnings
}) {
  return new Promise((resolve) => {
    const results = lintFile(fileArg, fix);
    resolve(suppressWarnings ? CLIEngine.getErrorResults(results) : results);
  });
}
