import { readFileSync } from 'fs';
import { execSync } from 'child_process';

import { findFile } from '../util.js';

export const stop = () => {
  const filePath = findFile('.esprintrc');
  const rc = JSON.parse(readFileSync(filePath));

  if (rc.port) {
    const { port } = rc;
    const command = `lsof -i TCP:${port} | grep LISTEN | awk '{print $2}' | xargs kill -9`;
    execSync(command);
    console.log(`Server running on port ${port} found and stopped`);
  } else {
    console.warn('No port specified in `.esprintrc` file');
  }
};
