import workerFarm from 'worker-farm';
import { promisify, flatten } from './util';

export default class LintRunner {
  constructor(numThreads) {
    const workers = workerFarm(
      {
        autoStart: true,
        maxConcurrentCallsPerWorker: Infinity,
        maxConcurrentWorkers: numThreads,
      },
      require.resolve('./LintWorker')
    );

    this.workers = promisify(workers)
  }

  run(config, files) {
    const that = this;
    return Promise.all(
      files.map((file, index) => {
        return that.workers({
          config: config,
          hash: 'foo',
          fileArg: file
        });
      })
    )
    .then(results => {
      return flatten(results);
    })
    .catch(e => {
      console.error(e.stack);
      process.exit(1);
    });
  }
}
