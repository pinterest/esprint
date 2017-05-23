# esprint [![npm version](https://img.shields.io/npm/v/esprint.svg?style=flat)](https://www.npmjs.com/package/esprint)

esprint speeds up eslint by running the linting engine across multiple threads, and optionally sets up a server daemon to cache the lint status of each file in memory. It uses a watcher to determine when files change, as to only re-lint what is necessary.

## Usage

To run the esprint server, run the following command:

```
$ esprint start --workers=[num_workers] --port=[port_number]
```

The `--workers` argument specifies how many worker threads you want to start linting your application (defaults to 4), while the `--port` argument
specifies which port to start the background server on (defaults to 5004).

If you want to kill the background server, run:

```
$ esprint kill
```

Otherwise, you can tell esprint to lint all files without spinning up a server:

```
$ esprint run --workers=[num_workers]
```

### `.esprintrc`
In order to use esprint, first place an `.esprintrc` file in your project. This is similar to a `.flowconfig`. The `.esprintrc` file describes
which paths to lint and which paths to ignore. The two required keys are `paths`, and `ignored`, which both take arrays of globs. A sample `.esprintrc` file is shown as follows:

```js
{
  "paths": [
      "foo/*.js",
      "bar/**/*.js",
    ],

  "ignored": [
      "**/node_modules/**/*"
    ]
}
```


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
