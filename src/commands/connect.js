import { fork } from "child_process";

import { isPortTaken } from "../util";
import { clearLine } from "../cliUtils";
import Client from "../Client";

export const connect = async (options) => {
  const args = [];
  // eslint-disable-next-line
  for (const key in options) {
    args.push(`--${key}=${options[key]}`);
  }

  const port = options.port;

  const isTaken = await isPortTaken(port);

  // start the server if it isn't running
  const client = new Client(options);

  if (!isTaken) {
    const child = fork(require.resolve("../startServer.js"), args, {
      silent: options.esprintDebug ? false : true,
    });

    child.on("message", async (message) => {
      if (message.server) {
        // Wait for the server to start before connecting
        await client.connect();
      } else if (message.message) {
        clearLine();
        process.stdout.write(message.message);
      }
    });
  } else {
    await client.connect();
  }
};
