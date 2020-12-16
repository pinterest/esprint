import { readFileSync } from 'fs';
import { execSync } from 'child_process';

import { findFile } from '../util.js';

export const stop = () => {
  const filePath = findFile('.esprintrc');
  const rc = JSON.parse(readFileSync(filePath));

  if (rc.port) {
    const { port } = rc;
    const command = `kill -9 $(lsof -t -i tcp:${port})`;
    try {
      execSync(command, {
        stdio: 'ignore'
      });
    } catch (error) {
      console.log(`No server runs on port ${port}`);
      return;
    }
    console.log(`Server running on port ${port} found and stopped`);
  } else {
    console.warn('No port specified in `.esprintrc` file');
  }
};
