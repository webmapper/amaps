# amaps
implementation of nlmaps for Amsterdam (for testing)

This repo contains a reference implementation of nlmaps with Amsterdam's extensions and styling, for testing purposes. The goal is to demonstrate correct working of nlmaps in an application using browser tests. For code unit testing, see the [nlmaps](https://github.com/webmapper/nlmaps) repository.

in `test/index.html is a simple webpage which loads the latest release of `nlmaps` (currently this is by pulling the browser js release from github.com/webmapper/nlmaps. It could also install `nlmaps` from npm.) The tests are defined or loaded in `test/test.js`. The tests include:

* testing for successful loading of map with nlmaps
* ARIA testing using pa11y.

The test runner is in `scripts/serve.js`. This serves index.html with a simple web server, and then runs tests from test.js.

Usage
-----

### Running directly
The tests can be run directly with:

    npm run test

During development, you can use e.g. [nodemon](https://github.com/remy/nodemon) to rerun the tests on changes to your test files:

    nodemon --watch scripts --watch test -e js,html scripts/serve.js


### with `docker-compose`


    docker-compose run test

or:

    docker-compose up --build --exit-code-from test test

Todo
----
* Tests are currently very basic. They will be expanded as new features are developed.
* install nlmaps from npm instead of loading from Github? (would require JS compile step).

