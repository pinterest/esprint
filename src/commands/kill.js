import path from 'path';
import { execSync } from 'child_process';

export const killPort = () => {
  const pathToScript = path.resolve('node_modules', 'esprint', 'scripts/killPort.sh');
  const command = `sh ${pathToScript}`;
  execSync(command);
}
