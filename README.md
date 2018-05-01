# amaps
implementation of nlmaps for Amsterdam (for testing)

This repo contains a reference implementation of nlmaps with Amsterdam's extensions and styling, for testing purposes. The goal is to demonstrate correct working of nlmaps in an application using browser tests. For code unit testing, see the [nlmaps](https://github.com/webmapper/nlmaps) repository.

in `test/index.html` is a simple webpage which loads the latest release of `nlmaps` (currently this is by pulling the browser js release from github.com/webmapper/nlmaps. It could also install `nlmaps` from npm.) The tests are defined or loaded in `test/test.js`. The tests include:

* testing for successful loading of map with nlmaps
* ARIA testing using pa11y.

The test runner is in `scripts/serve.js`. This serves index.html with a simple web server, and then runs tests from test.js.

Usage
-----

### with `docker-compose`

The primary way to run the tests is with `docker-compose`.

First build nlmaps with the `build-nlmaps` container. The results are put in a volume which will be shared to the test containers.

    docker-compose up --build build-nlmaps

now you can run the tests:

    docker-compose up --build --exit-code-from test test
    docker-compose up --build --exit-code-from watch-test watch-test
    docker-compose up --build --exit-code-from lint lint

### Running directly
In order to run the tests directly without `docker-compose`, you need to provide the compiled `nlmaps` code since the test html file expects to load it from the test server. You have two options:

1. modify `test/index.html` to load `nlmaps.iife.js` from a server somewhere (e.g. if you have built it with a custom config in a repo on Github)
2. clone and build nlmaps (optionally with a custom config), and then symlink the nlmaps directory into the `test` directory. First build nlmaps somewhere, and then you can symlink it. In the `test` directory:

    ln -s /path/to/nlmaps

3. run:

    npm run build

Now you can run the tests from the root directory:

    npm run test

During development, to rerun the tests on changes to your test files, run:

    npm run watch-test

To lint the code:

    npm run lint

To launch a development server:

    npm run serve


Todo
----
* Tests are currently very basic. They will be expanded as new features are developed.
* install nlmaps from npm instead of loading from Github? (would require JS compile step).

