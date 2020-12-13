import JestWorker from 'jest-worker';

export default class LintRunner {
  constructor(numThreads, suppressWarnings, fix) {
    this.worker = new JestWorker(
      require.resolve('./LintWorker'),
      {
        exposedMethods: ['worker'],
        numWorkers: numThreads,
        enableWorkerThreads: true,
      }
    );

    this.suppressWarnings = suppressWarnings;
    this.fix = fix;
  }

  run(files) {
    const that = this;
    return Promise.all(
      files.map((file) => {
        return that.worker.worker({
          fileArg: file,
          suppressWarnings: that.suppressWarnings,
          fix: that.fix,
        });
      })
    )
      .then(results => {
        const records = (results || []).flat();

        // produce a sum of total num of errors/warnings
        const { errorCount, warningCount } = records.reduce((a, b) => ({
          errorCount: a.errorCount + b.errorCount,
          warningCount: a.warningCount + b.warningCount,
        }), { errorCount: 0, warningCount: 0 });

        return {
          records,
          errorCount,
          warningCount,
        };
      })
      .catch(e => {
        console.error(e.stack);
        process.exit(1);
      });
  }
}
