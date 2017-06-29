## Developing for esprint

In order to use esprint in your project, clone the repository and install all of the dependencies.

```
$ git clone https://github.com/pinterest/esprint.git && cd esprint
$ yarn
```

In the esprint repo, run `yarn link`, and in your project that uses ESprint, run `yarn link esprint`. (Note: `yarn link` is only supported by `yarn` version 0.26 and later.)

After that, run `yarn run deps /path/to/project/` so that esprint installs all eslint-related dependencies.

In a separate tab, you can also run `npm start`. This starts up `babel-watcher`, which will compile your JavaScript.

Then, run esprint directly from your `node_modules` folder like so:

```
$ node ./node_modules/esprint/build/cli.js [opts]
```
