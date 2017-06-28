# esprint [![Build Status](https://img.shields.io/travis/pinterest/esprint/master.svg?style=flat)](https://travis-ci.org/pinterest/esprint) [![npm version](https://img.shields.io/npm/v/esprint.svg?style=flat)](https://www.npmjs.com/package/esprint)

esprint (pronounced E-S-sprint) speeds up eslint by running the linting engine across multiple threads, and optionally sets up a server daemon to cache the lint status of each file in memory. It uses a watcher to determine when files change, as to only re-lint what is necessary.

## Usage

In order to use esprint, first place an `.esprintrc` file in your project. This is similar to a `.flowconfig`. The `.esprintrc` file describes
which paths to lint, which paths to ignore, as well as (optionally) what port to start a lint server on.
A sample `.esprintrc` file is shown as follows:

```js
{
  "port": 5004 ,
  "paths": [
      "foo/*.js",
      "bar/**/*.js",
    ],

  "ignored": [
      "**/node_modules/**/*"
    ]
}
```

To run the esprint server, run the following command:

```
$ esprint
```

If the `port` key is not specified in the `.esprintrc` file, then esprint will run parallelized eslint without standing up a background server.

By default, esprint will split up linting duties across all CPUs in your machine. You can manually override this via the cli with the command:

```
$ esprint --workers=[num_workers]
```

If the server is running in the background, you can use the following command to stop the background server:

```
$ esprint kill
```

You can run `esprint` from any subdirectory that `.esprintrc` is located in, and it will still properly lint all files as specified.


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
