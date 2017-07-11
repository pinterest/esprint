import { readFileSync } from 'fs';
import { execSync } from 'child_process';

import { findFile } from '../util.js';

const stopServer = (port) => 
  `lsof -i TCP:${port} | grep LISTEN | awk '{print $2}' | xargs kill -9`;

export const stop = () => {
  const rcPath = findFile('.esprintrc');
  const rc = JSON.parse(readFileSync(filePath));
  const portFile = findFile('.esprint_port');

  let port; 

  if (rc.port) {
    port  = rc.port;
  } else {
    if (!portFile) { 
      console.warn('Esprint server not running. Exiting...'); 
      process.exit(0);
    } else {
      port = Number(fs.readFileSync(portFile));
      fs.unlinkSync(portFile);
    }
  }

  execSync(stopServer(port));
  console.log(`Server running on port ${port} found and stopped`);
};
