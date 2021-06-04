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

## Writing Tests

We encourage every contributor who writes a critical fix or a new feature to write an accompanying test. We've tried to make getting set-up and writing tests as easy as possible.

To start, from the root of the project, run `yarn run create-test [test-name]`, where `[test-name]` is the feature you're going to be testing. For naming examples, check out the `tests/` directory.
This command sets up all the necessary files and fixtures that you need to start writing tests.

For our test-runner/framework, we use [Jest](https://github.com/facebook/jest). For examples of how we expect tests to run, take a look at the tests that we have in place. These should serve as a
good baseline for writing new tests.

Once you're done writing your test(s), run `yarn run test` and ensure that all tests pass locally before submitting your PR.
