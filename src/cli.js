import { fork } from 'child_process';
import { isPortTaken } from './util';

isPortTaken(5004).then(isTaken => {
  if (!isTaken) {
    fork(require.resolve('./startServer.js'));
    require('./Client.js');
  } else {
    require('./Client.js');
  }
});
