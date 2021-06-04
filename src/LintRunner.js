import { Worker as JestWorker } from "jest-worker";

export default class LintRunner {
  constructor(numThreads, suppressWarnings, fix) {
    this.jestWorker = new JestWorker(require.resolve("./LintWorker"), {
      exposedMethods: ["worker"],
      numWorkers: numThreads,
    });

    this.suppressWarnings = suppressWarnings;
    this.fix = fix;
  }

  async run(files) {
    const that = this;

    try {
      const results = await Promise.all(
        files.map(async (file) => {
          try {
            const workerResult = await that.jestWorker.worker({
              fileArg: file,
              suppressWarnings: that.suppressWarnings,
              fix: that.fix,
            });
            return workerResult;
          } catch (error) {
            console.log(error);
          }
        })
      );

      const records = (results || []).flat();

      // produce a sum of total num of errors/warnings
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
    } catch (e) {
      console.error(e.stack);
      process.exit(1);
    }
  }
}
