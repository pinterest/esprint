import path from 'path';
import { execSync } from 'child_process';


export const killPort = () => {
  const command = `lsof -i TCP:5004 | grep LISTEN | awk '{print $2}' | xargs kill -9`;
  execSync(command);
  console.log("Server running on port 5004 found and killed");
}
