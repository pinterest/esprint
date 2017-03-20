import watchman from 'fb-watchman';

const VERSION_REQUIRED = 4;
const matchesMajorVersion = (str, ver) => str.startsWith(ver + '.');

const checkVersion = client => {
  return new Promise((resolve, reject) => {
    client.capabilityCheck(
      { optional: [], required: ['relative_root'] },
      function(error, resp) {
        if (error) {
          return reject(error);
        }
        // resp will be an extended version response:
        // {'version': '3.8.0', 'capabilities': {'relative_roots': true}}
        if (matchesMajorVersion(resp.version, VERSION_REQUIRED)) {
          return resolve();
        } else {
          return reject(
            `Watchman server version does not match ${VERSION_REQUIRED}`
          );
        }
      }
    );
  });
};

const startWatch = (client, dir) => {
  return new Promise((resolve, reject) => {
    client.command(['watch-project', dir], function(error, resp) {
      if (error) {
        return reject(`Error initiating watch: ${error}`);
      }

      // It is considered to be best practice to show any 'warning' or
      // 'error' information to the user, as it may suggest steps
      // for remediation
      if ('warning' in resp) {
        console.log('warning: ', resp.warning);
      }

      resolve({ watch: resp.watch, relPath: resp.relative_path });
    });
  });
};

const makeSubscription = (client, watch, relative_path) => {
  return new Promise((resolve, reject) => {
    const sub = {
      expression: [
        'allof',
        ['match', '*.js'],
        [
          'anyof',
          ['match', 'app/**/*', 'wholename'],
          ['match', 'const/**/*', 'wholename'],
          ['match', 'legacy_build/**/*', 'wholename'],
          ['match', 'node/**/*', 'wholename'],
          ['match', 'webpack/**/*', 'wholename']
        ],
        ['not', ['match', 'build/**/*', 'wholename']],
        ['not', ['match', '**/node_modules/**/*', 'wholename']]
      ],
      // Which fields we're interested in
      fields: ['name', 'size', 'mtime_ms', 'exists', 'type'],
      dedup_results: true
    };
    if (relative_path) {
      sub.relative_root = relative_path;
    }

    client.command(['subscribe', watch, 'esprint', sub], function(error, resp) {
      if (error) {
        return reject(`failed to subscribe: ${error}`);
      }
      resolve();
    });
  });
};

export default class WatchmanClient {
  constructor() {
    this.client = new watchman.Client();
  }

  watch(options) {
    checkVersion(this.client)
      .then(() => startWatch(this.client, options.dir))
      .then(({ watch, relPath }) =>
        makeSubscription(this.client, watch, relPath))
      .then(() => {
        // Subscription results are emitted via the subscription event.
        // Note that this emits for all subscriptions.  If you have
        // subscriptions with different `fields` you will need to check
        // the subscription name and handle the differing data accordingly.
        // `resp`  looks like this in practice:
        //
        // { root: '/private/tmp/foo',
        //   subscription: 'mysubscription',
        //   files: [ { name: 'node_modules/fb-watchman/index.js',
        //       size: 4768,
        //       exists: true,
        //       type: 'f' } ] }
        this.client.on('subscription', function(resp) {
          if (resp.subscription !== 'esprint') return;
          resp.files.forEach(function(file) {
            // convert Int64 instance to javascript integer
            file.mtime_ms = +file.mtime_ms;
            options.onChange(file);
          });
        });
      })
      .catch(error => {
        console.error(error);
      });
  }
}
