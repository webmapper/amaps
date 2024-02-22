# Amaps
Implementation of [NL Maps](https://nlmaps.nl) for Amsterdam

* For a demo, see https://map.data.amsterdam.nl/pointquery.html and https://map.data.amsterdam.nl/multiselect.html.

This repository contains `nlmaps` with a configuration file for Amsterdam, specifying Amsterdam's map styling and map layers. In addition, this repository contains several scripts for specific use cases, like querying certain APIs when the map is clicked. These specific cases are:

* point query (users selects a coordinate in a map and information about it is returned)
* multiple feature select (users selects one or more objects, parking spots in this case, and information about the selection is returned).

## How it works

- `pointquery.html`: demonstrates single-click functionality with a feature query.
- `multiselect.html`: demonstrates multiple feature selection from a feature datasource.

### with docker

To run the http server in Docker: `docker-compose up --build -d serve` (accessible on port 8095)
