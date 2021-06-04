import { ESLint } from "eslint";

const lintFile = async (fileArg, fix) => {
  if (!Array.isArray(fileArg)) {
    fileArg = [fileArg];
  }

  const eslint = new ESLint({ cwd: process.cwd(), fix });
  const report = await eslint.lintFiles(fileArg);
  await ESLint.outputFixes(report);
  return report;
};

export async function worker({ fileArg, fix, suppressWarnings }) {
  const results = await lintFile(fileArg, fix);
  return suppressWarnings ? ESLint.getErrorResults(results) : results;
}
