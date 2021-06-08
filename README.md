# esprint - a fast eslint runner [![GitHub Workflow Status](<https://img.shields.io/github/workflow/status/pinterest/esprint/Main%20workflow%20(PR)>)](https://github.com/pinterest/esprint/actions?query=workflow%3A%22Main+workflow+%28PR%29%22) [![npm version](https://img.shields.io/npm/v/esprint)](https://www.npmjs.com/package/esprint)

esprint (pronounced E-S-sprint) speeds up eslint by running the linting engine across multiple threads.
esprint sets up a server daemon to cache the lint status of each file in memory. It uses a watcher to determine when files change, to only lint files as necessary. It also has a CI mode where it does not set up a daemon and just lints in parallel.

## Configuration

In order to use esprint, first place an `.esprintrc` file in the root directory your project. This is similar to a `.flowconfig` if you use flow types. The `.esprintrc` file describes which paths to lint and which paths to ignore. You can also override the port to start the background server on.
A sample `.esprintrc` file:

```json
{
  "paths": ["foo/*.js", "bar/**/*.js"],
  "ignored": ["**/node_modules/**/*"],
  "port": 5004
}
```

Options:

|        Name        |       Type        | Description                                                                                                       |
| :----------------: | :---------------: | :---------------------------------------------------------------------------------------------------------------- |
|    **`paths`**     | `{Array<String>}` | Glob-style paths for files to include when linting                                                                |
|   **`ignored`**    | `{Array<String>}` | Glob-style paths to ignore (not watch) during dev mode for better performance (`.eslintignore` applies as normal) |
|     **`port`**     |    `{Number}`     | (optional) Run the esprint background server on a specific port                                                   |
|  **`formatter`**   |    `{string}`     | (optional) Use a specific output format - default: stylish                                                        |
|    **`quiet`**     |    `{boolean}`    | (optional) Report errors only - default: false                                                                    |
| **`maxWarnings`**  |    `{number}`     | (optional) The max number of warnings that should trigger a failure. The default is to not fail on warnings       |
| **`esprintDebug`** |    `{boolean}`    | (optional) Print debug output for esrpint. Should only be used when you're running into issues                    |
|  **`noWatchman`**  |    `{boolean}`    | (optional) Disable watchman                                                                                       |

## Usage

### Default mode

To run esprint, use the following command anywhere in your project:

```
$ esprint
```

esprint will find the root of your project automatically and lint the whole project. In default mode, esprint will start a background server to watch source files and cache lint results in memory.

By default, esprint will split up linting duties across all CPUs in your machine. You can manually override this via the cli with the following argument:

```
$ esprint --workers=[num_workers]
```

To kill the esprint server in the background & clear the cache, use the following command:

```
$ esprint stop
```

You can run `esprint` from any subdirectory that `.esprintrc` is located in, and it will still properly lint all files as specified.

### CI Mode

In CI environments, it is not always appropriate (or necessary) to start a background server. In this case, you can use the following command, which simply lints in parallel without setting up a background server:

```
$ esprint check
```

### CLI Options

#### Auto fix

To use the eslint auto fix feature, add `--fix` when starting the server

```
$ esprint --fix
```

or when running in CI mode

```
$ esprint check --fix
```

## Developing for esprint

Refer to [CONTRIBUTING](https://github.com/pinterest/esprint/blob/master/CONTRIBUTING.md)
