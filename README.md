# esprint [![npm version](https://img.shields.io/npm/v/esprint.svg?style=flat)](https://www.npmjs.com/package/esprint)

esprint speeds up eslint by running the linting engine across multiple threads, and setting up a server daemon to cache the lint status of each file in memory. It uses a watcher to determine when files change, as to only re-lint what is necessary.

## Usage
TODO

## Developing for ESprint

In order to use ESprint in your project, clone the repository and install all of the dependencies.

```
$ git clone https://github.com/arthuralee/esprint.git && cd esprint
$ yarn
```

In the ESprint repo, run `yarn link`, and in your project that uses ESprint, run `yarn link esprint`.

After that, run `yarn run deps /path/to/project/` so that esprint installs all eslint-related dependencies.

In a separate tab, you can also run `npm start`. This starts up `babel-watcher`, which will compile your JavaScript.

Then, run ESPrint directly from your `node_modules` folder like so:

```
$ node ./node_modules/esprint/build/cli.js [opts]
```
