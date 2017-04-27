import Server from './server';

let args = process.argv.slice(2);

// If no paths/files to lint were specified, just take the CWD
if (args.length === 2) {
  args.push(process.cwd());
}

process.send({serverArgs: args});

const server = new Server(args[0], args[1], args[2]);
