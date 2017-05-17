import workerFarm from 'worker-farm';
import { promisify, flatten } from './util';

const workers = workerFarm(
  {
    autoStart: true,
    maxConcurrentCallsPerWorker: Infinity
  },
  require.resolve('./LintWorker')
);

const workersPromise = promisify(workers);

export const run = (config, files) => {
  return Promise.all(
    files.map((file, index) => {
      return workersPromise({
        config: config,
        hash: 'foo',
        fileArg: file
      });
    })
  ).then(results => {
      // workerFarm.end(workers);
      return flatten(results);
    })
    .catch(e => {
      console.error(e.stack);
      process.exit(1);
    });
}
