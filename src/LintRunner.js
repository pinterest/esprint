import workerFarm from 'worker-farm';
import { promisify, flatten } from './util';

export default class LintRunner {
  constructor(numThreads, suppressWarnings, fix) {
    const workers = workerFarm(
      {
        autoStart: true,
        maxConcurrentCallsPerWorker: Infinity,
        maxConcurrentWorkers: numThreads,
      },
      require.resolve('./LintWorker')
    );

    this.workers = promisify(workers);
    this.suppressWarnings = suppressWarnings;
    this.fix = fix;
  }

  run(files) {
    const that = this;
    return Promise.all(
      files.map((file) => {
        return that.workers({
          fileArg: file,
          suppressWarnings: that.suppressWarnings,
          fix: that.fix,
        });
      })
    )
      .then(results => {
        const records = flatten(results);

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
