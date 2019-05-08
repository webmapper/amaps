# Amaps
Implementation of NL Maps for Amsterdam

* For a demo, see https://map.data.amsterdam.nl/
* For an explanation how to use this map in your own site, see [`src/README.md`](src/README.md).
* For documentation on the build/development setup, read on below.

This repository builds `nlmaps` with a configuration file for Amsterdam, specifying Amsterdam's map styling and map layers. In addition, this repository contains several wrapper scripts which bundle the resulting `nlmaps` build with functionality for specific use cases, like querying certain API's when the map is clicked. These specific cases are:

* point query (users selects a coordinate in a map and information about it is returned)
* multiple feature select (users selects one or more objects, parking spots in this case, and information about the selection is returned).


## How it works
This repo installs a local copy of `nlmaps`, then compiles it with the custom configuration file at `config/amsterdam.config.js`. In `test/` are html and js files for testing:

- `unit-test.js` tests code internally
- `browser-test.js` tests integration and accessibility in a headless browser
- `index.html`: tests/demonstrates Amsterdam configuration of `nlmaps`
- `pointquery.html`: tests/demonstrates single-click functionality with a feature query.
- `multiselect.html`: tests/demonstrates multiple feature selection from a feature datasource.


Versioning
----------
Changes to the config file (`config/amsterdam.config.js`) and to the functionality of the wrapper scripts should be reflected by updating the `version` field in `package.json`.

When `nlmaps` receives an update, the `nlmaps_version` field in `package.json` should be incremented to the new nlmaps version. The build process for `amaps` looks at this field to determine which release of `nlmaps` to pull and build.


Usage summary
-------------

### with npm, for local development

1. `npm install`
2. `npm run nlmaps` fetches and installs latest release of `nlmaps` and builds with custom config
3. `npm run build-amaps` compile the wrapper scripts and assets.

To serve (required before running `test` and `lint`): `npm run serve`.

To test: `npm run test`

To lint: `npm run lint`


#### development server
Instead of running the above commands separately, you can run a live-reloading development server: `npm run dev`. This watches `src/` and the config file in `config/amsterdam.config.js`, rebuilds and runs tests on changes. You can access the demo html pages at:

localhost:8080/index.html
localhost:8080/pointquery.html
localhost:8080/multiselect.html

If you want to serve and test without using the `dev` command, the server needs to be running in a separate terminal window.

#### production build and releasing

to build for production, which puts output in `dist/` instead of `test/dist/`, run:


`npm run build-amaps -- --production`

`dist/` will contain browser and Ecmascript builds of the Javascript for the `amaps` applications.

To subsequently create a release, create a tag, push it to Github, and annotate the tag so that it shows up on the 'releases' tab.


### with docker (used by Jenkins CI)

from a fresh install with no `build_nlmaps` docker image on your machine:

To run the http server in Docker: `docker-compose up --build -d serve` (accessible on port 8095)

To run tests and lint:

    docker-compose up --build --exit-code-from test test
    docker-compose up --build --exit-code-from lint lint

### how to use in a project

The amaps is dependent on amsterdam stijl package so is recomanded to install this in the project as well

    npm install amsterdam-stijl
    npm install amsterdam-amaps

    import 'amsterdam-amaps/nlmaps/assets/css/nlmaps.css';
    import 'stijl/dist/css/ams-stijl.css';

Import one of the next modules for specific functionality:

    import amaps from 'amsterdam-amaps/amaps';
    <or> import pointquery from 'amsterdam-amaps/pointquery';
    <or> import multiselect from 'amsterdam-amaps/multiselect';

Create the amaps with the custom configuration options

```js static
// For example
const options = {
    layer: 'standaard',
    target: 'mapdiv',
    marker: false,
    search: true,
    zoom: 0,
    onQueryResult: () => {}
};
amaps.createMap(options)
```
