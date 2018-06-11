# amaps
implementation of nlmaps for Amsterdam

This repository builds `nlmaps` with a configuration file for Amsterdam, specifying Amsterdam's map styling and map layers. In addition, this repository contains several wrapper scripts which bundle the resulting `nlmaps` build with functionality for specific use cases, like querying certain API's when the map is clicked. These specific cases are:

* MORA (meldingen openbare ruimte)
* TVM (tijdelijke verkeersmaatregelen).

in `test/index.html` is a simple webpage which loads the latest release of `nlmaps` (currently this is by pulling the browser js release from github.com/webmapper/nlmaps. It could also install `nlmaps` from npm.) The tests are defined or loaded in `test/test.js`. The tests include:

* unit testing of `amaps` library code
* testing for successful loading of map with nlmaps
* ARIA testing using pa11y.

The test runner is in `scripts/test.js`. This serves index.html with a simple web server, and then runs tests from test.js.


Versioning
----------
Changes to the config file (`config/amsterdam.config.js`) and to the functionality of the wrapper scripts should be reflected by updating the `version` field in `package.json`.

When `nlmaps` receives an update, the `nlmaps_version` field in `package.json` should be incremented to the new nlmaps version. The build process for `amaps` looks at this field to determine which release of `nlmaps` to pull and build.


Usage summary
-------------
from a fresh install with no `build_nlmaps` docker image on your machine:

    docker-compose up --build build-nlmaps
    docker-compose up --build --exit-code-from build-amaps build-amaps
    docker-compose up --build --exit-code-from lint
    docker-compose up --build -d serve
    docker-compose up --build --exit-code-from test
    #after tests are done:
    docker-compose stop serve
    
or with npm:

    npm run build #depends on symbolic linking: see below for making nlmaps available without symlinking.
    npm run build-amaps-dev
    npm run lint
    npm run serve
    #in new terminal:
    npm run test

for more detail, read on.

Building amaps
--------------

There are two outputs and two build scripts. One builds for production and puts the file in `dist/`; the other builds for testing and puts the file in `test/`.

### with `docker-compose`

With docker-compose, only the production build is available. The test build gets run automatically by the `test` container.

run `docker-compose up --build build-amaps`

### Running directly

run `npm run build-amaps`

or for testing: `npm run build-amaps-dev`

You probably want to lint the code first (`docker-compose up --build lint` or `npm run lint`).

Testing
-------

### with `docker-compose`

The primary way to run the tests is with `docker-compose`.

First build nlmaps with the `build-nlmaps` container. The results are put in a volume which will be shared to the test containers.

If you have run the build before, make sure to remove the docker _image_ because the nlmaps build happens at docker build time. This means if you don't remove the image, docker will reuse the existing one even if you tell docker-compose to build. Find the image name with `docker image ls` or `docker ps -a` and remove the image, e.g. : `docker rmi nlmaps_build`. Then:

    docker-compose up --build build-nlmaps

now you can run the tests:

    docker-compose up --build --exit-code-from test test
    docker-compose up --build --exit-code-from watch-test watch-test
    docker-compose up --build --exit-code-from lint lint

### Running directly
In order to run the tests directly without `docker-compose`, you need to provide the compiled `nlmaps` code since the test html file expects to load it from the test server. You have two options:

1. `npm run build` to build `nlmaps` and symlink it into the `test` directory
2. If that isn't possible because your platform doesn't support symlinks, modify `test/index.html` to load `nlmaps.iife.js` from a server somewhere (e.g. if you have built it with a custom config in a repo on Github)

    ln -s /path/to/nlmaps

Now you can run the tests from the root directory. First start the local server:

    npm run serve

and then you can run the tests:

    npm run test

During development, to rerun the tests on changes to your test files, run:

    npm run watch-test


    npm run lint

Todo
----
* Tests are currently very basic. They will be expanded as new features are developed.
* install nlmaps from npm instead of loading from Github? (would require JS compile step).
